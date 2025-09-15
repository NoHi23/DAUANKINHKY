import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchCart = async () => {
    if (user) {
      try {
        const response = await api.get('/cart');
        setCart(response.data);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCart({ items: [] }); // Khởi tạo giỏ hàng rỗng nếu có lỗi
      }
    } else {
      setCart(null); // Xóa giỏ hàng khi người dùng logout
    }
  };

  // Lấy giỏ hàng khi người dùng thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItemToCart = async (productId, quantity) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }
    try {
      const response = await api.post('/cart/items', { productId, quantity });
      setCart(response.data); // Cập nhật state giỏ hàng với dữ liệu mới từ server
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      alert("Thêm sản phẩm thất bại. Vui lòng thử lại.");
    }
  };
  const updateItemQuantity = async (productId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${productId}`, { quantity });
      setCart(response.data);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const removeItemFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/items/${productId}`);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItemToCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};