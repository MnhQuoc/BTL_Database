import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Badge } from 'react-bootstrap';
import { FaCrown, FaStar, FaGift, FaPercent } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Membership = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const membershipTiers = [
    {
      name: 'Thành viên Đồng',
      icon: <FaStar className="text-warning" />,
      color: '#CD7F32',
      benefits: [
        'Giảm 5% cho mọi đơn hàng',
        'Tích điểm cho mỗi đơn hàng',
        'Nhận thông báo khuyến mãi',
        'Ưu tiên hỗ trợ khách hàng'
      ],
      minOrders: 0,
      discount: 5
    },
    {
      name: 'Thành viên Bạc',
      icon: <FaStar className="text-secondary" />,
      color: '#C0C0C0',
      benefits: [
        'Giảm 10% cho mọi đơn hàng',
        'Tích điểm x2 cho mỗi đơn hàng',
        'Nhận voucher sinh nhật',
        'Miễn phí giao hàng cho đơn trên 200k',
        'Ưu tiên đặt bàn'
      ],
      minOrders: 10,
      discount: 10
    },
    {
      name: 'Thành viên Vàng',
      icon: <FaCrown className="text-warning" />,
      color: '#FFD700',
      benefits: [
        'Giảm 15% cho mọi đơn hàng',
        'Tích điểm x3 cho mỗi đơn hàng',
        'Nhận voucher sinh nhật trị giá 100k',
        'Miễn phí giao hàng không giới hạn',
        'Ưu tiên đặt bàn và chọn bàn',
        'Tham gia sự kiện VIP độc quyền'
      ],
      minOrders: 30,
      discount: 15
    }
  ];

  const handleJoinMembership = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      // Logic để đăng ký thành viên
      alert('Cảm ơn bạn đã đăng ký làm thành viên! Bạn sẽ nhận được các ưu đãi đặc biệt.');
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">👑 Chương Trình Hội Viên</h1>
        <p className="lead text-muted">
          Tham gia ngay để nhận nhiều ưu đãi đặc biệt và tích điểm cho mỗi đơn hàng
        </p>
      </div>

      <Row className="g-4 mb-5">
        {membershipTiers.map((tier, index) => (
          <Col key={index} md={4}>
            <Card 
              className="h-100 shadow-sm"
              style={{ 
                border: `2px solid ${tier.color}`,
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Card.Header 
                className="text-center py-4"
                style={{ backgroundColor: tier.color, color: 'white' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                  {tier.icon}
                </div>
                <h3 className="mb-0">{tier.name}</h3>
                <Badge bg="light" text="dark" className="mt-2">
                  Giảm {tier.discount}%
                </Badge>
              </Card.Header>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center mb-3">
                  <FaPercent className="me-2" />
                  Ưu đãi đặc biệt
                </Card.Title>
                <ul className="list-unstyled flex-grow-1">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="mb-2">
                      <FaGift className="text-success me-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Tối thiểu {tier.minOrders} đơn hàng để đạt hạng
                  </small>
                </div>
              </Card.Body>
              <Card.Footer className="text-center bg-transparent">
                <Button 
                  variant="primary" 
                  onClick={handleJoinMembership}
                  className="w-100"
                >
                  {isLoggedIn ? 'Đăng ký ngay' : 'Đăng nhập để tham gia'}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="bg-light border-0 p-4">
        <Card.Body>
          <h4 className="mb-3">📋 Cách thức hoạt động:</h4>
          <Row>
            <Col md={4} className="text-center mb-3">
              <div className="mb-2" style={{ fontSize: '2.5rem' }}>1️⃣</div>
              <h5>Đăng ký thành viên</h5>
              <p className="text-muted">Tạo tài khoản và đăng ký làm thành viên miễn phí</p>
            </Col>
            <Col md={4} className="text-center mb-3">
              <div className="mb-2" style={{ fontSize: '2.5rem' }}>2️⃣</div>
              <h5>Tích điểm khi mua hàng</h5>
              <p className="text-muted">Mỗi đơn hàng sẽ tích điểm tương ứng với số tiền bạn chi tiêu</p>
            </Col>
            <Col md={4} className="text-center mb-3">
              <div className="mb-2" style={{ fontSize: '2.5rem' }}>3️⃣</div>
              <h5>Nhận ưu đãi đặc biệt</h5>
              <p className="text-muted">Sử dụng điểm tích lũy để đổi voucher và nhận giảm giá</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Membership;

