const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const querystring = require('qs');
const crypto = require("crypto");
const axios = require("axios");

// @desc    Tạo đơn hàng mới từ giỏ hàng
// @route   POST /api/orders
// @access  Private (User)
exports.createOrder = async (req, res) => {
    const { shippingAddress, phone, paymentMethod } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống' });
        }

        let subTotal = 0;
        const orderItems = [];
        for (const item of cart.items) {
            if (item.product.stockQuantity < item.quantity) {
                throw new Error(`Sản phẩm "${item.product.name}" không đủ số lượng.`);
            }
            subTotal += item.quantity * item.product.price;
            orderItems.push({
                product: {
                    _id: item.product._id,
                    name: item.product.name,
                    image: item.product.images[0],
                },
                price: item.product.price,
                quantity: item.quantity,
            });
        }

        const shippingFee = 30000;
        const totalAmount = subTotal + shippingFee;

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            phone,
            paymentMethod,
            subTotal,
            shippingFee,
            totalAmount,
            // Với VietQR, trạng thái ban đầu luôn là chưa thanh toán
            status: 'pending',
            paymentStatus: 'pending',
        });

        // Cập nhật số lượng tồn kho
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stockQuantity: -item.quantity }
            });
        }

        await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } });

        // --- TẠO DỮ LIỆU VIETQR ĐỂ TRẢ VỀ ---
        let qrData = null;
        if (paymentMethod === 'VIETQR') {
            const bankId = process.env.VIETQR_BANK_ID;
            const accountNo = process.env.VIETQR_ACCOUNT_NO;
            const accountName = process.env.VIETQR_ACCOUNT_NAME;
            // Nội dung chuyển khoản chính là ID của đơn hàng để dễ dàng tra cứu
            const description = `Thanh toan don hang ${order._id}`;

            const qrImageUrl = `https://api.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${totalAmount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

            qrData = {
                qrImageUrl,
                amount: totalAmount,
                description: order._id.toString() // Gửi mã đơn hàng về để hiển thị cho người dùng
            };
        }

        res.status(201).json({
            message: "Đặt hàng thành công!",
            order,
            qrData // Trả về qrData nếu là thanh toán VietQR
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Lỗi server' });
    }
};


// @desc    Lấy các đơn hàng của người dùng đang đăng nhập
// @route   GET /api/orders
// @access  Private (User)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// @desc    Lấy chi tiết đơn hàng
// @route   GET /api/orders/:id
// @access  Private (User & Admin)
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};


// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
// @access  Admin, Moderator
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};


exports.createPaymentUrl = async (req, res) => {
    const { shippingAddress, phone } = req.body;
    const userId = req.user.id;
    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        let subTotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
        // Ở đây có thể thêm logic tính phí ship, coupon...
        const totalAmount = subTotal;

        // 1. Tạo đơn hàng trong DB với trạng thái "pending"
        const newOrder = await Order.create({
            user: userId,
            items: cart.items.map(i => ({ product: i.product._doc, quantity: i.quantity, price: i.product.price })),
            shippingAddress,
            phone,
            paymentMethod: 'VNPAY',
            subTotal,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
        });

        // 2. Tạo URL thanh toán VNPAY
        const tmnCode = process.env.VNPAY_TMN_CODE;
        const secretKey = process.env.VNPAY_HASH_SECRET;
        let vnpUrl = process.env.VNPAY_URL;
        const returnUrl = process.env.VNPAY_RETURN_URL;

        const date = new Date();
        const createDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;

        const orderId = newOrder._id.toString(); // Dùng ID của đơn hàng vừa tạo
        const amount = totalAmount;
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPAY yêu cầu nhân 100
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        vnp_Params = Object.keys(vnp_Params).sort().reduce((acc, key) => {
            acc[key] = vnp_Params[key];
            return acc;
        }, {});

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;

        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.status(200).json({ paymentUrl: vnpUrl });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// @desc    Xử lý kết quả trả về từ VNPAY
// @route   GET /api/orders/vnpay-return
// @access  Public
exports.vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các trường hash ra khỏi params để kiểm tra chữ ký
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp lại params theo alphabet
    vnp_Params = Object.keys(vnp_Params).sort().reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
    }, {});

    const secretKey = process.env.VNPAY_HASH_SECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];

    // Bắt đầu kiểm tra
    if (secureHash === signed) {
        try {
            const order = await Order.findById(orderId);
            if (order) {
                // Trường hợp 1: Giao dịch thành công
                if (responseCode == '00') {
                    // Cập nhật trạng thái thanh toán của đơn hàng là 'paid'
                    order.paymentStatus = 'paid';
                    // Bạn có thể cập nhật trạng thái đơn hàng thành 'processing' ở đây
                    // order.status = 'processing';
                    await order.save();

                    // Chuyển hướng về trang thành công
                    res.redirect('http://localhost:3000/payment-success');
                } else {
                    // Trường hợp 2: Giao dịch không thành công
                    // Giữ nguyên trạng thái đơn hàng là 'pending' hoặc có thể cập nhật thành 'failed'
                    res.redirect('http://localhost:3000/payment-fail');
                }
            } else {
                // Trường hợp không tìm thấy đơn hàng
                res.redirect('http://localhost:3000/payment-fail?message=OrderNotFound');
            }
        } catch (error) {
            // Lỗi server
            res.redirect('http://localhost:3000/payment-fail?message=ServerError');
        }
    } else {
        // Trường hợp 3: Chữ ký không hợp lệ
        res.redirect('http://localhost:3000/payment-fail?message=InvalidSignature');
    }
};


exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};


exports.createMomoUrl = async (req, res) => {
    const { shippingAddress, phone } = req.body;
    const userId = req.user.id;
    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống' });
        }

        const totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

        // 1. Tạo đơn hàng trong DB với trạng thái "pending"
        const newOrder = await Order.create({
            user: userId,
            items: cart.items.map(i => ({ product: i.product._doc, quantity: i.quantity, price: i.product.price })),
            shippingAddress, phone,
            paymentMethod: 'MOMO',
            subTotal: totalAmount, totalAmount,
            status: 'pending', paymentStatus: 'pending',
        });

        // 2. Tạo URL thanh toán MoMo
        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const requestId = partnerCode + new Date().getTime();
        const orderId = newOrder._id.toString();
        const orderInfo = "Thanh toan don hang DAKK";
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const amount = totalAmount.toString();
        const requestType = "captureWallet";
        const extraData = ""; // Có thể để trống hoặc truyền thêm dữ liệu

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode, accessKey, requestId, amount, orderId,
            orderInfo, redirectUrl, ipnUrl, extraData, requestType,
            signature, lang: 'vi'
        };

        const response = await axios.post(process.env.MOMO_API_ENDPOINT, requestBody);

        res.status(200).json({ paymentUrl: response.data.payUrl });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


exports.momoIpn = async (req, res) => {
    // Logic xác thực chữ ký và cập nhật đơn hàng ở đây
    // Đây là bước quan trọng để xác nhận thanh toán an toàn
    const { orderId, resultCode } = req.body;
    try {
        if (resultCode == 0) { // Giao dịch thành công
            const order = await Order.findById(orderId);
            if (order) {
                order.paymentStatus = 'paid';
                await order.save();
            }
        }
        // Phải trả về status 204 cho MoMo biết đã nhận được thông tin
        res.status(204).send();
    } catch (error) {
        res.status(500).send();
    }
};