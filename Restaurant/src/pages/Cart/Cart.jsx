import React, { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Container, Alert, Table, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import OrderHistory from './OrderHistory';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, totalAmount, addToCart } = useCart();
  const navigate = useNavigate();
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      setShowLoginMessage(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else if (cartItems.length === 0) {
      // Get current user's ID from localStorage
      const currentUser = JSON.parse(user);
      
      if (currentUser?.id) {
        // Only fetch products for the current user
        fetch(`http://localhost:3001/products?userId=${currentUser.id}`)
          .then(response => response.json())
          .then(products => {
            products.forEach(product => {
              if (!cartItems.some(item => item.id === product.id)) {
                addToCart(product);
              }
            });
          })
          .catch(error => console.error('Error fetching products:', error));
      }
    }
  }, [navigate, addToCart, cartItems.length]);

  if (showLoginMessage) {
    return (
      <Container className="mt-5">
        <Alert variant="warning" className="text-center">
          <h4>Vui lòng đăng nhập để xem giỏ hàng</h4>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5 min-vh-100 d-flex flex-column">
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Giỏ hàng của bạn</h2>
          <Button 
            variant="secondary"
            onClick={() => setShowOrderHistory(!showOrderHistory)}
          >
            {showOrderHistory ? 'Ẩn lịch sử đơn hàng' : 'Xem lịch sử đơn hàng'}
          </Button>
        </div>

        {cartItems.length > 0 ? (
          <>
            <Table responsive>
              <thead>
                <tr>
                  <th>Món ăn</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Tổng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="text-end mt-4 mb-5">
              <h4>Tổng cộng: {totalAmount.toLocaleString('vi-VN')}đ</h4>
              <Link to="/checkout" className="btn btn-primary mt-3">
                Tiến hành thanh toán
              </Link>
            </div>
          </>
        ) : (
          <Alert variant="info" className="text-center">
            <h4>Giỏ hàng trống</h4>
            <div className="mt-3">
              <Link to="/menu" className="btn btn-primary">
                Xem menu
              </Link>
            </div>
          </Alert>
        )}
        
        {showOrderHistory && (
          <>
            <hr className="my-5" />
            <OrderHistory />
          </>
        )}
      </div>
    </Container>
  );
};

export default Cart;