
import React, { useState, useEffect } from "react";
import "./Navbar.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import {
  FaRegBell,
  FaSignInAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaSearch,
  FaShoppingCart,
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
  const navigate = useNavigate();
  const location = useLocation();

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

      // Fetch tutorCourses và users để lấy thông tin
      Promise.all([
        fetch('http://localhost:3001/tutorCourses').then(res => res.json()),
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
        } else if (parsed.role === 'tutor') {
          // Tutor: lấy orders có tutorId = tutor.id
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
              HCMUT Tutor
            </NavLink>
          </div>
          <div className="d-flex align-items-center">
            <div className="nav-links d-none d-md-flex align-items-center me-3">
              {/* Role-based navigation: Admin, Tutor, User, or Guest */}
              {isLoggedIn && role === "admin" ? (
                <>
                  <NavLink to="/home" className="nav-link">
                    Trang chủ
                  </NavLink>
                  <NavLink to="/profile" className="nav-link">
                    Hồ sơ
                  </NavLink>
                  <NavLink to="/menu" className="nav-link">
                    Khóa học
                  </NavLink>
                  <NavLink to="/reports" className="nav-link">
                    Báo cáo và thống kê
                  </NavLink>
                </>
              ) : isLoggedIn && role === "tutor" ? (
                <>
                  <NavLink to="/home" className="nav-link">
                    Trang chủ
                  </NavLink>
                  <NavLink to="/my-sessions" className="nav-link">
                    Khóa học của tôi
                  </NavLink>
                  <NavLink to="/open-course" className="nav-link">
                    Đăng ký mở lớp
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
                                    {studentName} đã đăng ký khóa học "{courseName}"
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
                  <NavLink to="/my-sessions" className="nav-link">
                    Khóa học của tôi
                  </NavLink>
                  <NavLink to="/find-tutor" className="nav-link">
                    Đăng ký môn học
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
                              
                              return (
                                <div
                                  key={n.id}
                                  style={{
                                    padding: 10,
                                    borderBottom: "1px solid #f1f1f1",
                                  }}
                                >
                                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                                    Đăng ký thành công khóa học "{courseName}"
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
                  <NavLink to="/tutorials" className="nav-link">
                    Chương trình
                  </NavLink>
                  <NavLink to="/testimonials" className="nav-link">
                    Đánh giá
                  </NavLink>
                  <NavLink to="/blog" className="nav-link">
                    Cộng đồng
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
                {(role === "user" || role === "tutor") && (
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
              <strong>Tutor Support System</strong>
            </h1>
          </Container>
        </div>
      )}
    </header>
  );
};

export default NavbarWeb;
