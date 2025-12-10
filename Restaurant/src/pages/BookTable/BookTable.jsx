import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import './BookTable.css';

const BookTable = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reservationDateTime: '',
    name: '',
    phone: '',
    numberOfPeople: ''
  });
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'user') {
      navigate('/home');
      return;
    }

    setCurrentUser(user);

    // Lấy thông tin user từ API để điền form
    fetch(`http://localhost:3001/users/${user.id}`)
      .then(res => res.json())
      .then(userData => {
        setFormData({
          reservationDateTime: '',
          name: userData.name || userData.fullName || userData.username || '',
          phone: userData.phone || '',
          numberOfPeople: ''
        });
      })
      .catch(err => console.error('Error fetching user data:', err));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reservationDateTime) {
      setMessage('Vui lòng chọn ngày và giờ đặt bàn');
      return;
    }

    if (!formData.name || !formData.phone || !formData.numberOfPeople) {
      setMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (parseInt(formData.numberOfPeople) < 1) {
      setMessage('Số người phải lớn hơn 0');
      return;
    }

    try {
      // Lấy thông tin user hiện tại để cập nhật mảng reservations
      const userResponse = await fetch(`http://localhost:3001/users/${currentUser.id}`);
      const currentUserData = await userResponse.json();
      
      // Tạo reservation mới
      const newReservation = {
        time: new Date(formData.reservationDateTime).toISOString(),
        numberOfPeople: parseInt(formData.numberOfPeople),
        orderStatus: 'Chưa phục vụ'
      };
      
      // Thêm vào mảng reservations (nếu có) hoặc tạo mảng mới
      const existingReservations = currentUserData.reservations && Array.isArray(currentUserData.reservations) 
        ? currentUserData.reservations 
        : [];
      
      const updatedReservations = [...existingReservations, newReservation];
      
      const response = await fetch(`http://localhost:3001/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservations: updatedReservations,
          name: formData.name,
          phone: formData.phone
        }),
      });

      if (response.ok) {
        setMessage('Đặt bàn thành công!');
        setTimeout(() => {
          navigate('/my-orders');
        }, 1500);
      } else {
        setMessage('Không thể đặt bàn. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error booking table:', error);
      setMessage('Có lỗi xảy ra khi đặt bàn');
    }
  };

  // Lấy ngày tối thiểu (hôm nay)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Container className="book-table-container">
      <div className="book-table-header">
        <h2 className="book-table-title">Đặt bàn</h2>
        <p className="book-table-subtitle">Vui lòng điền thông tin để đặt bàn</p>
      </div>

      <Card className="book-table-card">
        <Card.Body>
          {message && (
            <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaCalendarAlt className="me-2" />
                Ngày và giờ đặt bàn *
              </Form.Label>
              <Form.Control
                type="datetime-local"
                name="reservationDateTime"
                value={formData.reservationDateTime}
                onChange={handleChange}
                min={getMinDateTime()}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tên khách hàng *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại *</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số người *</Form.Label>
              <Form.Control
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleChange}
                placeholder="Nhập số người"
                min="1"
                required
              />
            </Form.Group>

            <div className="book-table-actions">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/my-orders')}
                className="me-2"
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Đặt bàn
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookTable;

