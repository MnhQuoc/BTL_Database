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
  const [adminTab, setAdminTab] = useState('student');
  const [adminUsers, setAdminUsers] = useState([]);
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
        const response = await fetch('http://localhost:3001/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setAdminUsers(Array.isArray(data) ? data : []);
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

  const filteredAdminUsers = useMemo(() => {
    if (adminTab === 'student') {
      return adminUsers.filter((user) => user.role === 'user');
    }
    if (adminTab === 'tutor') {
      return adminUsers.filter((user) => user.role === 'tutor');
    }
    return adminUsers;
  }, [adminTab, adminUsers]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredAdminUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredAdminUsers.slice(startIndex, endIndex);

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
              className={`admin-nav-item ${adminTab === 'student' ? 'active' : ''}`}
              onClick={() => {
                setAdminTab('student');
                setCurrentPage(1);
              }}
            >
              Student
            </button>
            <button
              type="button"
              className={`admin-nav-item ${adminTab === 'tutor' ? 'active' : ''}`}
              onClick={() => {
                setAdminTab('tutor');
                setCurrentPage(1);
              }}
            >
              Tutor
            </button>
          </nav>
        </aside>

        <section className="admin-content">
          <header className="admin-content-header">
            <div>
              <h2>Danh sách {adminTab === 'student' ? 'học viên' : 'gia sư'}</h2>
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
            {!adminLoading && !adminError && filteredAdminUsers.length === 0 && (
              <div className="admin-state">Chưa có dữ liệu để hiển thị</div>
            )}
            {!adminLoading && !adminError && filteredAdminUsers.length > 0 && (
              <>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Họ và tên</th>
                        <th>Năm sinh</th>
                        <th>SĐT</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user, index) => {
                        const displayName = user.fullName || user.name || user.username || '—';
                        const birthYear =
                          user.birthYear || user.yearOfBirth || user.dobYear || '—';
                        const phone = user.phone || '—';
                        const email = user.email || '—';
                        return (
                          <tr key={user.id || index}>
                            <td>{startIndex + index + 1}</td>
                            <td>{displayName}</td>
                            <td>{birthYear}</td>
                            <td>{phone}</td>
                            <td>{email}</td>
                          </tr>
                        );
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
                      Trang {currentPage} / {totalPages}
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
