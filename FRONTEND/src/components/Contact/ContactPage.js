import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import './ContactPage.css';
import { notifySuccess, notifyError } from '../../services/notificationService'; // Giả sử bạn có dịch vụ thông báo

const ContactPage = () => {
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();

        // --- THAY THẾ CÁC GIÁ TRỊ NÀY BẰNG THÔNG TIN CỦA BẠN ---
        const YOUR_SERVICE_ID = 'service_e0rle3i';
        const YOUR_TEMPLATE_ID = 'template_jmnzwrm';
        const YOUR_PUBLIC_KEY = 'stBC_lw-CUtbI_AnJ';
        // ---------------------------------------------------------

        emailjs.sendForm(YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, form.current, YOUR_PUBLIC_KEY)
            .then((result) => {
                console.log(result.text);
                notifySuccess('Gửi liên hệ thành công! Chúng tôi sẽ sớm phản hồi.');
                form.current.reset(); // Xóa form sau khi gửi
            }, (error) => {
                console.log(error.text);
                notifyError('Gửi liên hệ thất bại. Vui lòng thử lại.');
            });
    };

    return (
        <div className="contact-page-container">
            <div className="contact-info-side">
                <h2>Dấu Ấn Kinh Kỳ Liên Hệ</h2>
                <div className="info-item">
                    <i className="fa-solid fa-location-dot"></i>
                    <p>Địa chỉ: Trường Đại Học FPT Hà Nội.</p>
                </div>
                <div className="info-item">
                    <i className="fa-solid fa-phone"></i>
                    <p>Số điện thoại: 039 292 0491</p>
                </div>
                <div className="info-item">
                    <i className="fa-solid fa-envelope"></i>
                    <p>Email: Dauankinhky@gmail.com</p>
                </div>
            </div>

            <div className="contact-form-side">
                <div className="contact-form-wrapper">
                    <h3>LIÊN HỆ VỚI CHÚNG TÔI</h3>
                    <form ref={form} onSubmit={sendEmail}>
                        <div className="form-group">
                            <input type="text" name="from_name" placeholder="Nguyễn Văn A" required />
                        </div>
                        <div className="form-group">
                            <input type="email" name="from_email" placeholder="nguyenvana@gmail.com" required />
                        </div>
                        <div className="form-group">
                            <input type="tel" name="from_phone" placeholder="Số điện thoại" required />
                        </div>
                        <div className="form-group">
                            <textarea name="message" placeholder="Nhập nội dung" required></textarea>
                        </div>
                        <button type="submit" className="submit-btn">Gửi liên hệ của bạn</button>
                    </form>
                </div>
                <div className="map-wrapper">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.506341458941!2d105.52528919999999!3d21.012416699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abc60e7d3f19%3A0x2be9d7d0b5abcbf4!2sFPT%20University!5e0!3m2!1sen!2s!4v1759379311990!5m2!1sen!2s"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Maps Location"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;