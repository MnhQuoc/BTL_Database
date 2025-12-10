import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AddressModal from './AddressModal';
import { useCart } from '../../contexts/CartContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [note, setNote] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    store: {
      name: 'Trưa nay ăn gì Store',
      address: '123 Đường ABC, Quận XYZ, Thành phố Đà Nẵng'
    },
    serviceFee: 15000,
    deliveryFee: 25000,
    discount: 0
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
  
    const user = JSON.parse(userStr);
    
    // Fetch user's addresses from db.json
    fetch(`http://localhost:3001/users/${user.id}`)
      .then(response => response.json())
      .then(userData => {
        if (userData.addresses && userData.addresses.length > 0) {
          const formattedAddresses = userData.addresses.map(addr => 
            `${addr.name} | ${addr.phone} | ${addr.address}`
          );
          setAddresses(formattedAddresses);
          setSelectedAddress(formattedAddresses[0]);
        }
      })
      .catch(error => console.error('Error fetching addresses:', error));
  
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [navigate]);

  const handleAddressModalClose = () => setShowAddressModal(false);
  const handleAddressModalShow = () => setShowAddressModal(true);

  const handleAddAddress = () => {
    handleAddressModalShow();
  };

  const handleSaveAddress = async (addressDetails) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const newAddress = {
        id: Date.now(), // tạo id unique
        name: addressDetails.recipientName,
        phone: addressDetails.phone,
        address: `${addressDetails.street}, ${addressDetails.ward}, ${addressDetails.district}, ${addressDetails.city}`
      };
  
      // Lấy thông tin user hiện tại
      const response = await fetch(`http://localhost:3001/users/${user.id}`);
      const userData = await response.json();
      
      // Thêm địa chỉ mới vào mảng addresses
      const updatedAddresses = [...(userData.addresses || []), newAddress];
  
      // Cập nhật user trong db.json với mảng addresses mới
      await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: updatedAddresses
        }),
      });
  
      // Format địa chỉ mới để hiển thị
      const formattedAddress = `${newAddress.name} | ${newAddress.phone} | ${newAddress.address}`;
      
      // Cập nhật state
      const newAddresses = [...addresses, formattedAddress];
      setAddresses(newAddresses);
      setSelectedAddress(formattedAddress);
      handleAddressModalClose();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Có lỗi xảy ra khi lưu địa chỉ');
    }
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const calculateTotal = () => {
    return totalAmount + orderDetails.serviceFee + orderDetails.deliveryFee - orderDetails.discount;
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      const order = {
        userId: user.id,
        items: cartItems,
        address: selectedAddress,
        paymentMethod,
        note,
        subtotal: totalAmount,
        serviceFee: orderDetails.serviceFee,
        deliveryFee: orderDetails.deliveryFee,
        discount: orderDetails.discount,
        total: calculateTotal(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        clearCart();
        navigate('/profile');
      } else {
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };

  return (
    <Container className="my-4">
      <h2>Thanh toán đơn hàng</h2>
      
      <Row className="mt-4">
        <Col md={8}>
          {/* Địa chỉ giao hàng */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Địa chỉ giao hàng</Card.Title>
              <Form>
                {addresses.map((address, index) => (
                  <Form.Check
                    key={index}
                    type="radio"
                    name="deliveryAddress"
                    id={`address-${index}`}
                    label={address}
                    value={address}
                    style={ { textAlign: 'left' }}
                    checked={selectedAddress === address}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                  />
                ))}
                <Button variant="outline-primary" onClick={handleAddAddress} className="mt-3">
                  + Thêm địa chỉ mới
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Phương thức thanh toán */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Phương thức thanh toán</Card.Title>
              <Form>
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  id="cod"
                  label="Thanh toán khi nhận hàng (COD)"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={handlePaymentMethodChange}
                />
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  id="card"
                  label="Thanh toán bằng ngân hàng"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={handlePaymentMethodChange}
                />
              </Form>
            </Card.Body>
          </Card>

          {/* Ghi chú */}
          <Card>
            <Card.Body>
              <Card.Title>Ghi chú cho cửa hàng</Card.Title>
              <Form.Control
                as="textarea"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú cho cửa hàng (không bắt buộc)"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Thông tin đơn hàng */}
          <Card>
            <Card.Body>
              <Card.Title>Thông tin đơn hàng</Card.Title>
              
              {/* Thông tin cửa hàng */}
              <div className="mb-3">
                <h6>{orderDetails.store.name}</h6>
                <small className="text-muted">{orderDetails.store.address}</small>
              </div>

              {/* Danh sách món */}
              <div className="mb-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between mb-2">
                    <span>{item.quantity}x {item.name}</span>
                  </div>
                ))}
              </div>

              <hr />

              {/* Chi tiết giá */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tổng đơn</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Giảm giá</span>
                  <span>-{orderDetails.discount.toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí dịch vụ</span>
                  <span>{orderDetails.serviceFee.toLocaleString()}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển</span>
                  <span>{orderDetails.deliveryFee.toLocaleString()}đ</span>
                </div>
              </div>

              <hr />

              {/* Tổng thanh toán */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <strong>Tổng số tiền</strong>
                <strong className="text-primary">
                  {calculateTotal().toLocaleString()}đ
                </strong>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                block 
                onClick={handleCheckout}
                className="w-100"
                disabled={!selectedAddress || cartItems.length === 0}
              >
                Giao Hàng
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddressModal
        show={showAddressModal}
        handleClose={handleAddressModalClose}
        handleSave={handleSaveAddress}
      />
    </Container>
  );
};

export default Checkout;