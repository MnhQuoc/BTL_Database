import React, { createContext, useState, useContext, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Load cart data from localStorage when component mounts
  useEffect(() => {
    const loadCart = () => {
      const user = localStorage.getItem('user');
      if (user) {
        const userId = JSON.parse(user).id;
        const savedCart = localStorage.getItem(`cart_${userId}`);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };

    loadCart();
  }, []);

  // Save cart data to localStorage whenever it changes
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    // Update cart count and total whenever items change
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const amount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setCartCount(count);
    setTotalAmount(amount);
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    const user = localStorage.getItem('user');
    if (user) {
      const userId = JSON.parse(user).id;
      localStorage.removeItem(`cart_${userId}`);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      totalAmount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};