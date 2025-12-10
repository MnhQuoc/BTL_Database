import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUtensils, FaTable, FaClock, FaUser } from 'react-icons/fa';
import './Staff.css';

const Staff = () => {
  const [menu, setMenu] = useState([]);
  const [todayOrders, setTodayOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'staff') {
      navigate('/home');
      return;
    }

    setCurrentUser(user);
    fetchData(user);
  }, [navigate]);

  const fetchData = async (user) => {
    try {
      setLoading(true);
      
      // Fetch menu (courses)
      const menuRes = await axios.get('http://localhost:3001/courses');
      setMenu(menuRes.data || []);

      // Fetch users and filter by reservationDateTime is today
      const usersRes = await axios.get('http://localhost:3001/users');
      const allUsers = usersRes.data || [];
      setUsers(allUsers);
      
      // Filter users: reservationDateTime is today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Lấy tất cả reservations từ tất cả users và flatten thành một mảng
      const allReservations = [];
      allUsers.forEach(userItem => {
        if (userItem.role === 'user') {
          // Ưu tiên đọc từ mảng reservations (cấu trúc mới)
          if (userItem.reservations && Array.isArray(userItem.reservations)) {
            userItem.reservations.forEach((res, index) => {
              allReservations.push({
                ...res,
                userId: userItem.id,
                userFullName: userItem.fullName || userItem.name || userItem.username || '—',
                userPhone: userItem.phone || '—',
                userEmail: userItem.email || '—',
                membershipTier: userItem.membershipTier || 'Chưa tham gia'
              });
            });
          }
          // Fallback: xử lý cấu trúc cũ (reservationDateTime)
          else if (userItem.reservationDateTime) {
            let reservationTime, numberOfPeople, orderStatus;
            if (typeof userItem.reservationDateTime === 'object' && userItem.reservationDateTime !== null) {
              reservationTime = userItem.reservationDateTime.time;
              numberOfPeople = userItem.reservationDateTime.numberOfPeople;
              orderStatus = userItem.reservationDateTime.orderStatus || userItem.orderStatus || 'Chưa phục vụ';
            } else {
              reservationTime = userItem.reservationDateTime;
              numberOfPeople = null;
              orderStatus = userItem.orderStatus || 'Chưa phục vụ';
            }
            
            allReservations.push({
              time: reservationTime,
              numberOfPeople: numberOfPeople,
              orderStatus: orderStatus,
              userId: userItem.id,
              userFullName: userItem.fullName || userItem.name || userItem.username || '—',
              userPhone: userItem.phone || '—',
              userEmail: userItem.email || '—',
              membershipTier: userItem.membershipTier || 'Chưa tham gia'
            });
          }
        }
      });

      // Filter reservations: chỉ lấy những reservation có ngày là hôm nay
      const todayReservations = allReservations.filter(res => {
        const reservationDate = new Date(res.time);
        reservationDate.setHours(0, 0, 0, 0);
        return reservationDate.getTime() === today.getTime();
      });

      // Sort by time
      todayReservations.sort((a, b) => {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        return dateA - dateB;
      });

      // Convert to table data format
      const tableData = todayReservations.map((res, index) => ({
        id: `${res.userId}-${index}`,
        userId: res.userId,
        reservationDateTime: res.time,
        numberOfPeople: res.numberOfPeople,
        fullName: res.userFullName,
        phone: res.userPhone,
        email: res.userEmail,
        membershipTier: res.membershipTier,
        orderStatus: res.orderStatus
      }));

      setTodayOrders(tableData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Hoàn thành': 'status-completed',
      'Đang chế biến': 'status-processing',
      'Chờ nhận hàng': 'status-pending',
      'Hủy': 'status-cancelled',
      'Đã hủy': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  };

  // Process table data with status mapping
  const tableData = useMemo(() => {
    return todayOrders.map(item => {
      // Determine table status from orderStatus
      let tableStatus = 'Chưa bắt đầu';
      if (item.orderStatus === 'Hoàn thành' || item.orderStatus === 'Đã hoàn thành') {
        tableStatus = 'Hoàn thành';
      } else if (item.orderStatus === 'Hủy' || item.orderStatus === 'Đã hủy') {
        tableStatus = 'Hủy';
      } else if (item.orderStatus === 'Đang chế biến' || item.orderStatus === 'Đang phục vụ') {
        tableStatus = 'Đang diễn ra';
      } else if (item.orderStatus === 'Chờ nhận hàng' || item.orderStatus === 'Chưa phục vụ') {
        tableStatus = 'Đang chờ phục vụ';
      } else if (item.orderStatus) {
        tableStatus = item.orderStatus;
      }
      
      return {
        ...item,
        tableStatus
      };
    });
  }, [todayOrders]);

  // Pagination
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [tableData, currentPage, itemsPerPage]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Hoàn thành': '#28a745',
      'Đang diễn ra': '#ffc107',
      'Đang chờ phục vụ': '#fd7e14',
      'Hủy': '#dc3545',
      'Chưa bắt đầu': '#6c757d'
    };
    return statusMap[status] || '#6c757d';
  };

  const getMembershipColor = (tier) => {
    const tierMap = {
      'Vàng': '#ffc107',
      'Bạc': '#c0c0c0',
      'Đồng': '#cd7f32',
      'Chưa tham gia': '#6c757d'
    };
    return tierMap[tier] || '#6c757d';
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="staff-container">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="staff-container">
      <div className="staff-header">
        <h1 className="staff-title">
          <FaUtensils className="title-icon" />
          Quản lý phục vụ
        </h1>
        <div className="staff-date">
          <FaClock /> {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <div className="staff-content">
        {/* Menu Section */}
        <section className="menu-section">
          <h2 className="section-title">
            <FaUtensils className="section-icon" />
            Thực đơn
          </h2>
          <div className="menu-grid">
            {menu.length === 0 ? (
              <div className="empty-state">Chưa có món ăn nào trong thực đơn</div>
            ) : (
              menu.map((item) => (
                <div key={item.id} className="menu-card">
                  <div className="menu-card-image">
                    <img 
                      src={item.image || 'https://via.placeholder.com/200'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200';
                      }}
                    />
                  </div>
                  <div className="menu-card-content">
                    <h3 className="menu-card-title">{item.name}</h3>
                    {item.note && <p className="menu-card-note">{item.note}</p>}
                    <div className="menu-card-footer">
                      {item.serviceFee && (
                        <span className="menu-card-price">
                          {item.serviceFee.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Tables Section */}
        <section className="tables-section">
          <h2 className="section-title">
            <FaTable className="section-icon" />
            Bàn phục vụ hôm nay ({tableData.length})
          </h2>
          {tableData.length === 0 ? (
            <div className="empty-state">
              <FaTable className="empty-icon" />
              <p>Chưa có bàn nào được phục vụ hôm nay</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="tables-table">
                  <thead>
                    <tr>
                      <th>NGÀY VÀ GIỜ ĐẶT BÀN</th>
                      <th>HỌ VÀ TÊN</th>
                      <th>SĐT</th>
                      <th>EMAIL</th>
                      <th>TRẠNG THÁI BÀN</th>
                      <th>HỘI VIÊN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDateTime(item.reservationDateTime)}</td>
                        <td>{item.fullName}</td>
                        <td>{item.phone}</td>
                        <td>{item.email}</td>
                        <td>
                          <span 
                            className="table-status-text"
                            style={{ color: getStatusColor(item.tableStatus) }}
                          >
                            {item.tableStatus}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="membership-text"
                            style={{ color: getMembershipColor(item.membershipTier) }}
                          >
                            {item.membershipTier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                  <span className="pagination-info">
                    Trang {currentPage} / {totalPages} ({new Date().toLocaleDateString('vi-VN')})
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Staff;

