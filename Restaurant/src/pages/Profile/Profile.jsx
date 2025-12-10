import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    name: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [adminTab, setAdminTab] = useState('guest');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  // Kiểm tra xem thông tin có được điền đầy đủ không
  const hasIncompleteInfo = () => {
    return !userData.email || !userData.name || !userData.phone || !userData.address;
  };

  useEffect(() => {
    // Kiểm tra đăng nhập
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    // Lấy thông tin user từ API
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || ''); // Lưu role của user
        const response = await fetch(`http://localhost:3001/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData({
            username: data.username,
            email: data.email || '',
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || ''
          });

          // Kiểm tra và hiển thị thông báo nếu thông tin chưa đầy đủ
          if (!data.email || !data.name || !data.phone || !data.address) {
            setMessage('Vui lòng cập nhật thông tin');
          }
        } else {
          setMessage('Vui lòng cập nhật thông tin');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage('Có lỗi xảy ra khi tải thông tin');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (userRole !== 'admin') return;
    const fetchAllUsers = async () => {
      try {
        setAdminLoading(true);
        setAdminError('');
        const [usersRes, ordersRes] = await Promise.all([
          fetch('http://localhost:3001/users'),
          fetch('http://localhost:3001/orders')
        ]);
        if (!usersRes.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersRes.json();
        setAdminUsers(Array.isArray(usersData) ? usersData : []);
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setAdminOrders(Array.isArray(ordersData) ? ordersData : []);
        }
      } catch (error) {
        console.error('Error fetching all users:', error);
        setAdminError('Không thể tải danh sách người dùng');
      } finally {
        setAdminLoading(false);
      }
    };

    fetchAllUsers();
  }, [userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa thông báo khi người dùng bắt đầu nhập thông tin
    if (message === 'Vui lòng cập nhật thông tin') {
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra xem còn trường nào trống không
    if (hasIncompleteInfo()) {
      setMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      const response = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setMessage('Cập nhật thông tin thành công!');
      } else {
        setMessage('Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  // Hàm sắp xếp chức vụ từ cao xuống thấp
  const getPositionOrder = (position) => {
    const order = {
      'Quản lý': 1,
      'Đầu bếp trưởng': 2,
      'Đầu bếp': 3,
      'Phục vụ trưởng': 4,
      'Phục vụ': 5,
      'Thu ngân': 6,
      'Bảo vệ': 7
    };
    return order[position] || 999; // Nếu không có chức vụ thì đặt cuối
  };

  const filteredAdminUsers = useMemo(() => {
    if (adminTab === 'guest') {
      return adminUsers.filter((user) => user.role === 'user');
    }
    if (adminTab === 'staff') {
      const staffUsers = adminUsers.filter((user) => user.role === 'staff');
      // Sắp xếp theo chức vụ từ cao xuống thấp
      return staffUsers.sort((a, b) => {
        const posA = getPositionOrder(a.position || a.role || '');
        const posB = getPositionOrder(b.position || b.role || '');
        return posA - posB;
      });
    }
    return adminUsers;
  }, [adminTab, adminUsers]);

  // Tạo danh sách guest với thông tin đặt bàn
  const guestWithReservations = useMemo(() => {
    if (adminTab !== 'guest') return [];
    
    // Flatten tất cả reservations từ users thành một mảng
    const allGuestReservations = [];
    filteredAdminUsers.forEach(user => {
      if (user.role === 'user') {
        // Ưu tiên đọc từ mảng reservations (cấu trúc mới)
        if (user.reservations && Array.isArray(user.reservations)) {
          user.reservations.forEach((res, index) => {
            allGuestReservations.push({
              ...user,
              reservationDateTime: res.time,
              orderStatusFromReservation: res.orderStatus,
              numberOfPeople: res.numberOfPeople,
              reservationIndex: index
            });
          });
        }
        // Fallback: xử lý cấu trúc cũ (reservationDateTime)
        else if (user.reservationDateTime) {
          let reservationDateTime = user.reservationDateTime;
          let orderStatusFromReservation = null;
          
          if (typeof reservationDateTime === 'object' && reservationDateTime !== null) {
            orderStatusFromReservation = reservationDateTime.orderStatus;
            reservationDateTime = reservationDateTime.time;
          }
          
          allGuestReservations.push({
            ...user,
            reservationDateTime: reservationDateTime,
            orderStatusFromReservation: orderStatusFromReservation
          });
        }
      }
    });
    
    return allGuestReservations.map(user => {
      const reservationDateTime = user.reservationDateTime;
      const orderStatusFromReservation = user.orderStatusFromReservation;
      
      // Xác định trạng thái bàn dựa trên orderStatus từ reservationDateTime, user, order status hoặc thời gian
      let tableStatus = 'Chưa bắt đầu';
      if (reservationDateTime) {
        // Ưu tiên kiểm tra orderStatus từ reservationDateTime object trước
        if (orderStatusFromReservation) {
          // Map orderStatus từ reservationDateTime sang table status
          if (orderStatusFromReservation === 'Hoàn thành' || orderStatusFromReservation === 'Đã hoàn thành') {
            tableStatus = 'Hoàn thành';
          } else if (orderStatusFromReservation === 'Hủy' || orderStatusFromReservation === 'Đã hủy' || orderStatusFromReservation === 'cancelled') {
            tableStatus = 'Hủy';
          } else {
            tableStatus = orderStatusFromReservation;
          }
        } else if (user.orderStatus) {
          // Map orderStatus từ user sang table status
          if (user.orderStatus === 'Hoàn thành' || user.orderStatus === 'Đã hoàn thành') {
            tableStatus = 'Hoàn thành';
          } else if (user.orderStatus === 'Hủy' || user.orderStatus === 'Đã hủy' || user.orderStatus === 'cancelled') {
            tableStatus = 'Hủy';
          } else {
            tableStatus = user.orderStatus;
          }
        } else {
          // Nếu không có orderStatus từ user, kiểm tra status từ order
          const userOrders = adminOrders.filter(order => order.userId === user.id);
          const latestOrder = userOrders.length > 0 
            ? userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
            : null;
          
          // Nếu order có status, sử dụng status đó
          if (latestOrder && latestOrder.status) {
            // Map order status sang table status
            if (latestOrder.status === 'Hoàn thành' || latestOrder.status === 'Đã hoàn thành') {
              tableStatus = 'Hoàn thành';
            } else if (latestOrder.status === 'Hủy' || latestOrder.status === 'Đã hủy' || latestOrder.status === 'cancelled') {
              tableStatus = 'Hủy';
            } else if (latestOrder.status === 'Đang phục vụ' || latestOrder.status === 'Đang chế biến') {
              tableStatus = 'Đang diễn ra';
            } else if (latestOrder.status === 'Chưa phục vụ' || latestOrder.status === 'Chờ nhận hàng' || latestOrder.status === 'pending') {
              // Kiểm tra thời gian để xác định trạng thái chi tiết hơn
              const orderDate = new Date(reservationDateTime);
              const now = new Date();
              const diffHours = (now - orderDate) / (1000 * 60 * 60);
              
              if (diffHours < 0) {
                tableStatus = 'Chưa bắt đầu';
              } else {
                tableStatus = 'Đang chờ phục vụ';
              }
            } else {
              tableStatus = latestOrder.status;
            }
          } else {
            // Nếu không có status, dùng logic thời gian nhưng không tự động đánh "Hoàn thành"
            const orderDate = new Date(reservationDateTime);
            const now = new Date();
            const diffHours = (now - orderDate) / (1000 * 60 * 60);
            
            if (diffHours < 0) {
              tableStatus = 'Chưa bắt đầu';
            } else if (diffHours < 2) {
              tableStatus = 'Đang diễn ra';
            } else {
              // Không tự động đánh "Hoàn thành", chỉ đánh "Đang chờ phục vụ" nếu chưa có status
              tableStatus = 'Đang chờ phục vụ';
            }
          }
        }
      }

      // Sử dụng membershipTier từ db.json nếu có, nếu không thì tính từ orders
      const membershipTier = user.membershipTier || 
        (() => {
          const userOrders = adminOrders.filter(order => order.userId === user.id);
          return userOrders.length >= 30 ? 'Vàng' 
            : userOrders.length >= 10 ? 'Bạc'
            : userOrders.length >= 5 ? 'Đồng'
            : 'Chưa tham gia';
        })();

      return {
        ...user,
        tableStatus,
        membershipTier,
        reservationDateTime
      };
    })
    .filter(user => user.reservationDateTime) // Chỉ lấy những user có đặt bàn
    .sort((a, b) => {
      // Sắp xếp theo giờ đặt bàn (từ sớm đến muộn)
      if (!a.reservationDateTime && !b.reservationDateTime) return 0;
      if (!a.reservationDateTime) return 1;
      if (!b.reservationDateTime) return -1;
      return new Date(a.reservationDateTime) - new Date(b.reservationDateTime);
    });
  }, [adminTab, filteredAdminUsers, adminOrders]);

  // Nhóm guest theo ngày đặt bàn
  const guestsByDate = useMemo(() => {
    if (adminTab !== 'guest') return {};
    
    const grouped = {};
    guestWithReservations.forEach(guest => {
      if (guest.reservationDateTime) {
        const date = new Date(guest.reservationDateTime).toLocaleDateString('vi-VN');
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(guest);
      }
    });
    
    // Sắp xếp các ngày
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'));
    });
    
    const sortedGrouped = {};
    sortedDates.forEach(date => {
      sortedGrouped[date] = grouped[date];
    });
    
    return sortedGrouped;
  }, [adminTab, guestWithReservations]);

  // Tính toán phân trang
  // Với guest: phân trang theo ngày
  // Với staff: phân trang theo số lượng items
  const dateKeys = useMemo(() => {
    if (adminTab === 'guest') {
      return Object.keys(guestsByDate);
    }
    return [];
  }, [adminTab, guestsByDate]);

  const totalPages = adminTab === 'guest' 
    ? dateKeys.length 
    : Math.ceil(filteredAdminUsers.length / itemsPerPage);
  
  // Tính toán startIndex cho phân trang staff
  const startIndex = adminTab === 'staff' 
    ? (currentPage - 1) * itemsPerPage 
    : 0;
  
  const paginatedUsers = adminTab === 'guest'
    ? (dateKeys[currentPage - 1] ? guestsByDate[dateKeys[currentPage - 1]] : [])
    : (() => {
        const endIndex = startIndex + itemsPerPage;
        return filteredAdminUsers.slice(startIndex, endIndex);
      })();
  
  const displayData = adminTab === 'guest' ? guestWithReservations : filteredAdminUsers;

  // Reset về trang 1 nếu trang hiện tại vượt quá tổng số trang
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (userRole === 'admin') {
    return (
      <div className="admin-profile-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">Admin</div>
          <nav className="admin-sidebar-menu">
            <button
              type="button"
              className={`admin-nav-item ${adminTab === 'guest' ? 'active' : ''}`}
              onClick={() => {
                setAdminTab('guest');
                setCurrentPage(1);
              }}
            >
              Guest
            </button>
            <button
              type="button"
              className={`admin-nav-item ${adminTab === 'staff' ? 'active' : ''}`}
              onClick={() => {
                setAdminTab('staff');
                setCurrentPage(1);
              }}
            >
              Staff
            </button>
            <button
              type="button"
              className={`admin-nav-item ${adminTab === 'warehouse' ? 'active' : ''}`}
              onClick={() => {
                setAdminTab('warehouse');
                setCurrentPage(1);
              }}
            >
              Warehouse
            </button>
          </nav>
        </aside>

        <section className="admin-content">
          {adminTab === 'warehouse' ? (
            <>
              <header className="admin-content-header">
                <div>
                  <h2>Quản lý kho</h2>
                  <p className="admin-content-subtitle">
                    Theo dõi và quản lý nguyên liệu, hàng hóa trong kho.
                  </p>
                </div>
              </header>
              <div className="admin-table-card">
                <div className="admin-state">
                  Tính năng quản lý kho đang được phát triển...
                </div>
              </div>
            </>
          ) : (
            <>
              <header className="admin-content-header">
                <div>
                  <h2>Danh sách {adminTab === 'guest' ? 'khách hàng' : 'nhân viên'}</h2>
                  <p className="admin-content-subtitle">
                    Theo dõi nhanh thông tin cơ bản của từng tài khoản.
                  </p>
                </div>
              </header>

              <div className="admin-table-card">
                {adminLoading && <div className="admin-state">Đang tải dữ liệu...</div>}
                {!adminLoading && adminError && (
                  <div className="admin-state admin-state-error">{adminError}</div>
                )}
                {!adminLoading && !adminError && displayData.length === 0 && (
                  <div className="admin-state">Chưa có dữ liệu để hiển thị</div>
                )}
                {!adminLoading && !adminError && displayData.length > 0 && (
                  <>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            {adminTab === 'guest' ? (
                              <>
                                <th>Ngày và giờ đặt bàn</th>
                                <th>Họ và tên</th>
                                <th>SĐT</th>
                                <th>Email</th>
                                <th>Trạng thái bàn</th>
                                <th>Hội viên</th>
                              </>
                            ) : (
                              <>
                                <th>STT</th>
                                <th>Họ và tên</th>
                                <th>Chức vụ</th>
                                <th>Năm sinh</th>
                                <th>SĐT</th>
                                <th>Email</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.map((user, index) => {
                            const displayName = user.fullName || user.name || user.username || '—';
                            const birthYear =
                              user.birthYear || user.yearOfBirth || user.dobYear || '—';
                            const phone = user.phone || '—';
                            const email = user.email || '—';
                            
                            if (adminTab === 'guest') {
                              // Xử lý cả trường hợp cũ (string) và mới (object)
                              let reservationTime = user.reservationDateTime;
                              if (reservationTime && typeof reservationTime === 'object' && reservationTime !== null) {
                                reservationTime = reservationTime.time;
                              }
                              
                              const reservationDateTime = reservationTime 
                                ? new Date(reservationTime).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '—';
                              
                              const statusColor = {
                                'Hoàn thành': '#28a745',
                                'Đang diễn ra': '#ffc107',
                                'Đang chờ phục vụ': '#fd7e14',
                                'Hủy': '#dc3545',
                                'Chưa bắt đầu': '#6c757d'
                              }[user.tableStatus] || '#6c757d';
                              
                              return (
                                <tr key={user.id || index}>
                                  <td>{reservationDateTime}</td>
                                  <td>{displayName}</td>
                                  <td>{phone}</td>
                                  <td>{email}</td>
                                  <td>
                                    <span style={{ 
                                      color: statusColor, 
                                      fontWeight: '600' 
                                    }}>
                                      {user.tableStatus || '—'}
                                    </span>
                                  </td>
                                  <td>
                                    <span style={{
                                      color: user.membershipTier === 'Vàng' ? '#FFD700' :
                                             user.membershipTier === 'Bạc' ? '#C0C0C0' :
                                             user.membershipTier === 'Đồng' ? '#CD7F32' : '#6c757d',
                                      fontWeight: '600'
                                    }}>
                                      {user.membershipTier || 'Chưa tham gia'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            } else {
                              // Staff tab
                              const position = user.position || 'Chưa xác định';
                              return (
                                <tr key={user.id || index}>
                                  <td>{startIndex + index + 1}</td>
                                  <td>{displayName}</td>
                                  <td style={{ fontWeight: '600', color: '#233879' }}>{position}</td>
                                  <td>{birthYear}</td>
                                  <td>{phone}</td>
                                  <td>{email}</td>
                                </tr>
                              );
                            }
                          })}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div className="admin-pagination">
                        <button
                          type="button"
                          className="admin-pagination-btn"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </button>
                        <div className="admin-pagination-info">
                          {adminTab === 'guest' 
                            ? `Ngày ${currentPage} / ${totalPages}${dateKeys[currentPage - 1] ? ` (${dateKeys[currentPage - 1]})` : ''}`
                            : `Trang ${currentPage} / ${totalPages}`
                          }
                        </div>
                        <button
                          type="button"
                          className="admin-pagination-btn"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="text-center mb-4">Thông tin cá nhân</h2>
              {message && (
                <div className={`alert ${message === 'Vui lòng cập nhật thông tin' || message === 'Vui lòng điền đầy đủ thông tin' ? 'alert-warning' : message.includes('thành công') ? 'alert-success' : 'alert-info'}`} role="alert">
                  {message}
                </div>
              )}
              <form onSubmit={handleSubmit}>
              
                <div className="mb-3">
                  <label style={{textAlign: 'left', display: 'block'}} className="form-label">Họ và tên:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={userData.name}
                   readOnly
                  />
                </div>

                <div className="mb-3">
                  <label style={{textAlign: 'left', display: 'block'}} className="form-label">Email:</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={userData.email}
                  readOnly
                  />
                </div>

                <div className="mb-3">
                  <label style={{textAlign: 'left', display: 'block'}} className="form-label">Số điện thoại:</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={userData.phone}
                  readOnly
                  />
                </div>

                <div className="mb-3">
                  <label style={{textAlign: 'left', display: 'block'}} className="form-label">Địa chỉ:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={userData.address}
                    readOnly
                  />
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-primary flex-grow-1 mx-2"
                    onClick={() => navigate('/users')}
                  >
                    Cập nhật thông tin
                  </button>
                  {userRole !== 'tutor' && (
                    <button 
                      type="button" 
                      className="btn btn-success flex-grow-1 mx-2"
                      onClick={() => navigate('/signup')}
                    >
                      Trở thành Tutor
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
