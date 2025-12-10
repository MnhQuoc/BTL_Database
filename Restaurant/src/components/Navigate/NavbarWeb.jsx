
import React, { useState, useEffect } from "react";
import "./Navbar.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import {
  FaRegBell,
  FaSignInAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaSearch,
  FaShoppingCart,
  FaCheck,
} from "react-icons/fa";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const NavbarWeb = () => {
  const [role, setRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [tutorCourses, setTutorCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [membershipInfo, setMembershipInfo] = useState({ tier: '', progress: '', benefits: [] });
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Định nghĩa các ưu đãi theo từng cấp độ hội viên
  const membershipBenefits = {
    'Đồng': [
      'Giảm 5% cho mọi đơn hàng',
      'Tích điểm cho mỗi đơn hàng',
      'Nhận thông báo khuyến mãi',
      'Ưu tiên hỗ trợ khách hàng'
    ],
    'Bạc': [
      'Giảm 10% cho mọi đơn hàng',
      'Tích điểm x2 cho mỗi đơn hàng',
      'Nhận voucher sinh nhật',
      'Miễn phí giao hàng cho đơn trên 200k',
      'Ưu tiên đặt bàn'
    ],
    'Vàng': [
      'Giảm 15% cho mọi đơn hàng',
      'Tích điểm x3 cho mỗi đơn hàng',
      'Nhận voucher sinh nhật trị giá 100k',
      'Miễn phí giao hàng không giới hạn',
      'Ưu tiên đặt bàn và chọn bàn',
      'Tham gia sự kiện VIP độc quyền'
    ],
    'Chưa tham gia': []
  };

  // Hàm chuẩn hóa chuỗi (bỏ dấu, đổi về chữ thường)
  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      // Hiển thị name thay vì username
      setUsername(parsedUser.name || parsedUser.fullName || parsedUser.username || "");
      setRole(parsedUser.role);
      setIsLoggedIn(true);
      
      // Lấy thông tin membership cho user
      if (parsedUser.role === 'user') {
        fetch(`http://localhost:3001/users/${parsedUser.id}`)
          .then(res => res.json())
          .then(userData => {
            const tier = userData.membershipTier || 'Chưa tham gia';
            let progress = '';
            
            // Tính toán tiến trình dựa trên số đơn hàng
            fetch(`http://localhost:3001/orders?userId=${parsedUser.id}`)
              .then(res => res.json())
              .then(orders => {
                const orderCount = Array.isArray(orders) ? orders.length : 0;
                let nextTier = '';
                let ordersNeeded = 0;
                let currentProgress = 0;
                let targetProgress = 0;
                
                if (tier === 'Chưa tham gia') {
                  nextTier = 'Đồng';
                  ordersNeeded = 5 - orderCount;
                  currentProgress = orderCount;
                  targetProgress = 5;
                } else if (tier === 'Đồng') {
                  nextTier = 'Bạc';
                  ordersNeeded = 10 - orderCount;
                  currentProgress = orderCount;
                  targetProgress = 10;
                } else if (tier === 'Bạc') {
                  nextTier = 'Vàng';
                  ordersNeeded = 30 - orderCount;
                  currentProgress = orderCount;
                  targetProgress = 30;
                } else if (tier === 'Vàng') {
                  progress = 'Đã đạt cấp cao nhất';
                }
                
                if (progress === '') {
                  const percentage = Math.min(100, Math.round((currentProgress / targetProgress) * 100));
                  progress = `${currentProgress}/${targetProgress} đơn hàng (${percentage}%) - Cần ${ordersNeeded} đơn để lên ${nextTier}`;
                }
                
                const benefits = membershipBenefits[tier] || [];
                setMembershipInfo({ tier, progress, benefits });
              })
              .catch(err => {
                console.error("Error fetching orders:", err);
                const benefits = membershipBenefits[tier] || [];
                setMembershipInfo({ tier, progress: 'Không thể tải tiến trình', benefits });
              });
          })
          .catch(err => {
            console.error("Error fetching user data:", err);
            setMembershipInfo({ tier: 'Chưa tham gia', progress: '', benefits: [] });
          });
      }
    } else {
      setIsLoggedIn(false); 
      setUsername("");
      setRole("");
    }
  }, []);


  // Fetch notifications (using orders for the current user) when logged in
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    try {
      const parsed = JSON.parse(userStr);
      if (!parsed || !parsed.id) return;

      // Fetch menu và users để lấy thông tin
      Promise.all([
        fetch('http://localhost:3001/menu').then(res => res.json()),
        fetch('http://localhost:3001/users').then(res => res.json())
      ]).then(([coursesData, usersData]) => {
        setTutorCourses(coursesData || []);
        setUsers(usersData || []);

        // Fetch orders dựa vào role
        if (parsed.role === 'user') {
          // User: lấy orders của chính user đó
          fetch(`http://localhost:3001/orders?userId=${parsed.id}`)
            .then((res) => res.json())
            .then((data) => {
              const sorted = Array.isArray(data)
                ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                : [];
              setNotifications(sorted.slice(0, 5));
            })
            .catch((err) => console.error("Error fetching notifications:", err));
        } else if (parsed.role === 'staff') {
          // Staff: lấy orders có tutorId = staff.id
          fetch(`http://localhost:3001/orders?tutorId=${parsed.id}`)
            .then((res) => res.json())
            .then((data) => {
              const sorted = Array.isArray(data)
                ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                : [];
              setNotifications(sorted.slice(0, 5));
            })
            .catch((err) => console.error("Error fetching notifications:", err));
        }
      }).catch((err) => console.error("Error fetching data:", err));
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }, [isLoggedIn]);
  // Helper functions để lấy thông tin
  const getCourseName = (courseId) => {
    if (!courseId) return '—';
    const course = tutorCourses.find(c => c.id === courseId.toString());
    return course?.name || '—';
  };

  const getUserName = (userId) => {
    if (!userId) return '—';
    const user = users.find(u => u.id === userId.toString());
    return user?.name || user?.fullName || user?.username || '—';
  };

  // inline logout to avoid referencing removed functions
  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUsername("");
    navigate("/");
  };

  return (
    <header className={`hero-header ${isLoggedIn && role === 'admin' ? 'logged-in' : ''}`}>
      <nav className="top-nav">
        <Container className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <img src="images/logoBK.png" alt="Logo" className="logo" />
            <NavLink className="brand ms-2" to="/home">
              Restaurant App
            </NavLink>
          </div>
          <div className="d-flex align-items-center">
            <div className="nav-links d-none d-md-flex align-items-center me-3">
              {/* Role-based navigation: Admin, Tutor, User, or Guest */}
              {isLoggedIn && role === "admin" ? (
                <>
                  <NavLink to="/profile" className="nav-link">
                    Hồ sơ
                  </NavLink>
                  <NavLink to="/reports" className="nav-link">
                    Báo cáo và thống kê
                  </NavLink>
                </>
              ) : isLoggedIn && role === "staff" ? (
                <>
                  <NavLink to="/home" className="nav-link">
                    Trang chủ
                  </NavLink>
                  <NavLink to="/staff" className="nav-link">
                    Quản lý phục vụ
                  </NavLink>
                  <div className="position-relative ms-2">
                    <button
                      className="btn btn-link text-light p-0"
                      onClick={() => setShowNotif(!showNotif)}
                      aria-label="Thông báo"
                    >
                      <FaRegBell size={18} />
                    </button>
                    {showNotif && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "28px",
                          width: 320,
                          background: "#fff",
                          color: "#000",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          borderRadius: 6,
                          zIndex: 9999,
                        }}
                      >
                        <div
                          style={{
                            padding: 10,
                            borderBottom: "1px solid #eee",
                            fontWeight: "bold",
                          }}
                        >
                          Thông báo
                        </div>
                        <div style={{ maxHeight: 280, overflowY: "auto" }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: 12 }}>
                              Không có thông báo
                            </div>
                          ) : (
                            notifications.map((n) => {
                              // Lấy tutorCoursesID từ order (hỗ trợ cả cấu trúc cũ và mới)
                              const courseId = n.tutorCoursesID || (n.items && n.items[0] && (n.items[0].foodId || n.items[0].id));
                              const courseName = getCourseName(courseId);
                              const studentName = getUserName(n.userId);
                              
                              return (
                                <div
                                  key={n.id}
                                  style={{
                                    padding: 10,
                                    borderBottom: "1px solid #f1f1f1",
                                  }}
                                >
                                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                                    {studentName} đã đặt món "{courseName}"
                                  </div>
                                  <div style={{ fontSize: 12, color: "#666" }}>
                                    {n.createdAt
                                      ? new Date(n.createdAt).toLocaleString()
                                      : ""}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div style={{ padding: 8, textAlign: "center" }}>
                          <button
                            className="btn btn-sm btn-link"
                            onClick={() => {
                              setShowNotif(false);
                              navigate("/notifications");
                            }}
                          >
                            Xem tất cả
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : isLoggedIn && role === "user" ? (
                <>
                  <NavLink to="/home" className="nav-link">
                    Trang chủ
                  </NavLink>
                  <NavLink to="/book-table" className="nav-link">
                    Đặt bàn
                  </NavLink>
                  <NavLink to="/my-orders" className="nav-link">
                    Lịch sử đặt bàn
                  </NavLink>
                  <NavLink to="/browse-menu" className="nav-link">
                    Xem thực đơn
                  </NavLink>
                  <NavDropdown
                    title={`Hội viên${membershipInfo.tier ? `: ${membershipInfo.tier}` : ''}`}
                    id="membership-dropdown"
                    className="nav-link"
                    menuVariant="dark"
                  >
                    <NavDropdown.ItemText className="text-dark">
                      <div style={{ padding: '8px 12px', minWidth: '250px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '15px' }}>
                          Hội viên hiện tại: <span style={{ color: membershipInfo.tier === 'Vàng' ? '#FFD700' : membershipInfo.tier === 'Bạc' ? '#C0C0C0' : membershipInfo.tier === 'Đồng' ? '#CD7F32' : '#666' }}>
                            {membershipInfo.tier || 'Chưa tham gia'}
                          </span>
                        </div>
                        {membershipInfo.progress && (
                          <>
                            <div style={{ fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>
                              Tiến trình:
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {membershipInfo.progress}
                            </div>
                          </>
                        )}
                      </div>
                    </NavDropdown.ItemText>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      onClick={() => setShowBenefitsModal(true)}
                      className="text-dark"
                      style={{ cursor: 'pointer' }}
                    >
                      Xem ưu đãi
                    </NavDropdown.Item>
                  </NavDropdown>
                  
                  {/* Modal hiển thị ưu đãi */}
                  <Modal
                    show={showBenefitsModal}
                    onHide={() => setShowBenefitsModal(false)}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>
                        Ưu đãi hội viên {membershipInfo.tier || 'Chưa tham gia'}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {membershipInfo.benefits && membershipInfo.benefits.length > 0 ? (
                        <div>
                          {membershipInfo.benefits.map((benefit, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                marginBottom: '12px',
                                padding: '8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px'
                              }}
                            >
                              <FaCheck
                                style={{
                                  color: membershipInfo.tier === 'Vàng' ? '#FFD700' : 
                                         membershipInfo.tier === 'Bạc' ? '#C0C0C0' : 
                                         membershipInfo.tier === 'Đồng' ? '#CD7F32' : '#666',
                                  marginRight: '10px',
                                  marginTop: '2px',
                                  flexShrink: 0
                                }}
                              />
                              <span style={{ fontSize: '15px', lineHeight: '1.5' }}>
                                {benefit}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          <p>Bạn chưa tham gia chương trình hội viên.</p>
                          <Button
                            variant="primary"
                            onClick={() => {
                              setShowBenefitsModal(false);
                              navigate('/membership');
                            }}
                          >
                            Tham gia ngay
                          </Button>
                        </div>
                      )}
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={() => setShowBenefitsModal(false)}>
                        Đóng
                      </Button>
                    </Modal.Footer>
                  </Modal>
 
                  <div className="position-relative ms-2">
                    <button
                      className="btn btn-link text-light p-0"
                      onClick={() => setShowNotif(!showNotif)}
                      aria-label="Thông báo"
                    >
                      <FaRegBell size={18} />
                    </button>
                    {showNotif && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "28px",
                          width: 320,
                          background: "#fff",
                          color: "#000",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          borderRadius: 6,
                          zIndex: 9999,
                        }}
                      >
                        <div
                          style={{
                            padding: 10,
                            borderBottom: "1px solid #eee",
                            fontWeight: "bold",
                          }}
                        >
                          Thông báo
                        </div>
                        <div style={{ maxHeight: 280, overflowY: "auto" }}>
                          {notifications.length === 0 ? (
                            <div style={{ padding: 12 }}>
                              Không có thông báo
                            </div>
                          ) : (
                            notifications.map((n) => {
                              // Lấy tutorCoursesID từ order (hỗ trợ cả cấu trúc cũ và mới)
                              const courseId = n.tutorCoursesID || (n.items && n.items[0] && (n.items[0].foodId || n.items[0].id));
                              const courseName = getCourseName(courseId);
                              
                              return (
                                <div
                                  key={n.id}
                                  style={{
                                    padding: 10,
                                    borderBottom: "1px solid #f1f1f1",
                                  }}
                                >
                                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                                    Đặt món thành công "{courseName}"
                                  </div>
                                  <div style={{ fontSize: 12, color: "#666" }}>
                                    {n.createdAt
                                      ? new Date(n.createdAt).toLocaleString()
                                      : ""}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div style={{ padding: 8, textAlign: "center" }}>
                          <button
                            className="btn btn-sm btn-link"
                            onClick={() => {
                              setShowNotif(false);
                              navigate("/orders");
                            }}
                          >
                            Xem tất cả
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <NavLink to="/home" className="nav-link">
                    Trang chủ
                  </NavLink>
                  <NavLink to="/menu" className="nav-link">
                    Thực đơn
                  </NavLink>
                  <NavLink to="/promotions" className="nav-link">
                    Khuyến mãi
                  </NavLink>
                  <NavLink to="/membership" className="nav-link">
                    Hội viên
                  </NavLink>
                  <NavLink to="/about" className="nav-link">
                    Giới thiệu
                  </NavLink>
                  <NavLink to="/contact" className="nav-link">
                    Liên hệ
                  </NavLink>
                </>
              )}
            </div>

            {!isLoggedIn ? (

              <NavLink to="/login" className="btn btn-primary login-btn">
                <FaSignInAlt /> Đăng nhập
              </NavLink>
            ) : (
              <NavDropdown
                title={
                  <span>
                    <FaUserCircle /> {username}
                  </span>
                }
                id="user-dropdown"
                className="text-light"
                menuVariant="dark"
              >
                {(role === "user" || role === "staff") && (
                  <NavDropdown.Item
                    as={NavLink}
                    to="/profile"
                    className="text-dark"
                  >
                    Hồ sơ
                  </NavDropdown.Item>
                )}
                {role === "admin" && (
                  <NavDropdown.Item
                    as={NavLink}
                    to="/users"
                    className="text-dark"
                  >
                    Quản lý tài khoản
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-dark">
                  <FaSignOutAlt /> Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </div>
        </Container>
      </nav>

      {location.pathname === "/home" && (!isLoggedIn || (isLoggedIn && role !== "admin")) && (
        <div className="hero-content">
          <Container>
            <h1 className="hero-title">
              <strong>Restaurant Management System</strong>
            </h1>
          </Container>
        </div>
      )}
    </header>
  );
};

export default NavbarWeb;
