import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './MySessions.css';

const MySessions = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Đang xử lý');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchReservations = async () => {
      try {
        const currentUser = JSON.parse(user);
        if (!currentUser?.id) {
          setLoading(false);
          return;
        }

        const role = currentUser.role || '';
        setUserRole(role);

        // Nếu là staff: lấy các món ăn mà staff đang quản lý từ menu
        if (role === 'staff') {
          const menuRes = await fetch('http://localhost:3001/menu');
          const allMenuItems = await menuRes.json();
          const menuItems = allMenuItems.filter(item => 
            (item.staffId || item.tutorId) === currentUser.id.toString()
          );
          // Convert menu items to reservation-like format for staff
          const staffReservations = menuItems.map(item => ({
            id: item.id,
            name: item.name,
            reservationDateTime: null,
            orderStatus: item.status || 'Còn',
            type: 'menu'
          }));
          setReservations(staffReservations);
          setLoading(false);
          return;
        }

        // Nếu là user: lấy lịch đặt bàn của user (từ users table với reservations hoặc reservationDateTime)
        const usersRes = await fetch('http://localhost:3001/users');
        const usersData = await usersRes.json();
        
        // Tìm user hiện tại và lấy thông tin đặt bàn
        const currentUserData = usersData.find(u => String(u.id) === String(currentUser.id));
        
        if (currentUserData) {
          let reservationsList = [];
          
          // Ưu tiên đọc từ mảng reservations (cấu trúc mới)
          if (currentUserData.reservations && Array.isArray(currentUserData.reservations)) {
            reservationsList = currentUserData.reservations.map((res, index) => ({
              id: `${currentUser.id}-${index}`,
              reservationDateTime: res.time,
              numberOfPeople: res.numberOfPeople,
              orderStatus: res.orderStatus,
              name: currentUserData.name || currentUserData.fullName || currentUserData.username,
              phone: currentUserData.phone
            }));
          } 
          // Fallback: xử lý cấu trúc cũ (reservationDateTime)
          else if (currentUserData.reservationDateTime) {
            const reservationData = currentUserData.reservationDateTime;
            let time, numberOfPeople, orderStatus;
            
            if (typeof reservationData === 'object' && reservationData !== null) {
              // Cấu trúc mới: { time, numberOfPeople, orderStatus }
              time = reservationData.time;
              numberOfPeople = reservationData.numberOfPeople;
              orderStatus = reservationData.orderStatus || currentUserData.orderStatus || 'Chưa phục vụ';
            } else {
              // Cấu trúc cũ: string
              time = reservationData;
              numberOfPeople = null;
              orderStatus = currentUserData.orderStatus || 'Chưa phục vụ';
            }
            
            reservationsList = [{
              id: currentUser.id,
              reservationDateTime: time,
              numberOfPeople: numberOfPeople,
              orderStatus: orderStatus,
              name: currentUserData.name || currentUserData.fullName || currentUserData.username,
              phone: currentUserData.phone
            }];
          }
          
          setReservations(reservationsList);
        } else {
          setReservations([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Format date time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '—';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date only
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '—';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time only
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '—';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return <FaCheckCircle className="status-icon completed" />;
      case 'Hủy':
        return <FaTimesCircle className="status-icon cancelled" />;
      case 'Chưa phục vụ':
      default:
        return <FaHourglassHalf className="status-icon pending" />;
    }
  };

  // Get status text color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'status-completed';
      case 'Hủy':
        return 'status-cancelled';
      case 'Chưa phục vụ':
      default:
        return 'status-pending';
    }
  };

  // Filter reservations based on selected filter
  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'Tất cả') return true;
    if (filter === 'Đang xử lý') {
      return reservation.orderStatus === 'Chưa phục vụ';
    }
    if (filter === 'Đã hoàn thành') {
      return reservation.orderStatus === 'Hoàn thành';
    }
    return true;
  });

  if (loading) {
    return (
      <Container className="my-sessions-container">
        <div className="text-center mt-5">Đang tải...</div>
      </Container>
    );
  }

  return (
    <Container className="my-sessions-container">
      <div className="my-sessions-header">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="my-sessions-title">Lịch đặt bàn của tôi</h2>
        </div>
        
        <div className="filter-dropdown-wrapper">
          <select 
            className="filter-dropdown"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
            <option value="Tất cả">Tất cả</option>
          </select>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-card">
            <p className="empty-state-text">Bạn chưa có lịch đặt bàn nào</p>
            <div className="empty-state-actions">
              {userRole === 'staff' ? (
                <button 
                  className="btn btn-primary btn-lg mt-3"
                  onClick={() => navigate('/add-dish')}
                >
                  Thêm món ăn
                </button>
              ) : (
                <button 
                  className="btn btn-primary btn-lg mt-3"
                  onClick={() => navigate('/book-table')}
                >
                  Đặt bàn ngay
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="reservations-grid">
          {filteredReservations.map((reservation) => (
            <div 
              key={reservation.id} 
              className={`reservation-card ${reservation.id % 2 === 0 ? 'reservation-card-blue' : 'reservation-card-purple'}`}
            >
              <div className="reservation-icon">
                <FaCalendarAlt />
              </div>
              
              <div className="reservation-content">
                <h3 className="reservation-title">Đặt bàn</h3>
                
                {reservation.reservationDateTime && (
                  <>
                    <div className="reservation-detail">
                      <FaCalendarAlt className="detail-icon" />
                      <span className="detail-label">Ngày:</span>
                      <span className="detail-value">{formatDate(reservation.reservationDateTime)}</span>
                    </div>
                    
                    <div className="reservation-detail">
                      <FaClock className="detail-icon" />
                      <span className="detail-label">Giờ:</span>
                      <span className="detail-value">{formatTime(reservation.reservationDateTime)}</span>
                    </div>
                  </>
                )}

                {reservation.numberOfPeople && (
                  <div className="reservation-detail">
                    <FaUsers className="detail-icon" />
                    <span className="detail-label">Số người:</span>
                    <span className="detail-value">{reservation.numberOfPeople} người</span>
                  </div>
                )}

                <div className="reservation-status">
                  {getStatusIcon(reservation.orderStatus)}
                  <span className={`status-text ${getStatusClass(reservation.orderStatus)}`}>
                    {reservation.orderStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default MySessions;

