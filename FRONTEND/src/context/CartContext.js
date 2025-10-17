import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';
import { notifyInfo, notifyError } from '../services/notificationService';

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
        setCart({ items: [] });
      }
    } else {
      setCart(null);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItemToCart = async (productId, quantity) => {
    try {
      const response = await api.post('/cart/items', { productId, quantity });

      if (response.status === 200) {
        setCart(response.data);
        return true;
      }
      return false;
    } catch (error) {
      let errorMessage = 'Không thể thêm sản phẩm vào giỏ hàng.';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      notifyError(errorMessage);
      return false;
    }
  };
  const updateItemQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeItemFromCart(productId);
        return true;
      }
      const response = await api.put(`/cart/items/${productId}`, { quantity });
      if (response.status === 200) {
        setCart(response.data);
        return true;
      }
      return false;
    } catch (error) {
      let errorMessage = 'Cập nhật số lượng thất bại.';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

      notifyError(errorMessage);
      return false;
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
    <CartContext.Provider value={{ cart, addItemToCart, fetchCart, updateItemQuantity, removeItemFromCart }}>
      {children}
    </CartContext.Provider>
  );
};