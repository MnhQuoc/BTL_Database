import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import './FindTutor.css';
import '../RecommendFood/About.css';

const FindTutor = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Lấy user hiện tại
        const userStr = localStorage.getItem('user');
        let currentUserId = null;
        if (userStr) {
          const user = JSON.parse(userStr);
          currentUserId = user.id?.toString();
        }

        // Fetch tutorCourses, users và orders
        const [tutorCoursesRes, usersRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:3001/tutorCourses'),
          axios.get('http://localhost:3001/users'),
          currentUserId ? axios.get(`http://localhost:3001/orders?userId=${currentUserId}`) : Promise.resolve({ data: [] })
        ]);

        const allTutorCourses = tutorCoursesRes.data || [];
        const usersData = usersRes.data || [];
        const orders = ordersRes.data || [];

        // Lấy danh sách courseId đã đăng ký từ orders
        const enrolledCourseIds = new Set();
        orders.forEach(order => {
          // Hỗ trợ cả cấu trúc cũ (items) và mới (tutorCoursesID)
          if (order.tutorCoursesID) {
            enrolledCourseIds.add(order.tutorCoursesID.toString());
          } else if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const courseId = item.foodId || item.id;
              if (courseId) {
                enrolledCourseIds.add(courseId.toString());
              }
            });
          }
        });
        
        // Lọc các khóa học: chưa full và chưa được user đăng ký
        const availableCourses = allTutorCourses.filter(course => {
          const isNotFull = course.status !== 'Full' && course.status !== 'full';
          const isNotEnrolled = !enrolledCourseIds.has(course.id.toString());
          return isNotFull && isNotEnrolled;
        });

        setCourses(availableCourses);
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Lấy tên tutor từ tutorId
  const getTutorName = (tutorId) => {
    if (!tutorId) return '—';
    const tutor = users.find(u => u.id === tutorId.toString());
    return tutor?.name || tutor?.fullName || tutor?.username || '—';
  };

  // Lấy thông tin tutor từ tutorId
  const getTutorInfo = (tutorId) => {
    if (!tutorId) return null;
    const tutor = users.find(u => u.id === tutorId.toString());
    return tutor;
  };

  // Xử lý đăng ký khóa học
  const handleRegister = async (course) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Vui lòng đăng nhập để đăng ký khóa học');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      
      // Tạo order để đăng ký khóa học
      const orderData = {
        userId: user.id.toString(),
        tutorId: course.tutorId,
        tutorCoursesID: course.id.toString(),
        createdAt: new Date().toISOString()
      };

      await axios.post('http://localhost:3001/orders', orderData);
      
      // Cập nhật status của course thành "Full" hoặc giữ nguyên nếu cần
      // await axios.patch(`http://localhost:3001/tutorCourses/${course.id}`, {
      //   status: 'Full'
      // });

      alert('Đăng ký khóa học thành công!');
      setSelectedCourse(null);
      
      // Refresh danh sách courses và orders
      const [tutorCoursesRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:3001/tutorCourses'),
        axios.get(`http://localhost:3001/orders?userId=${user.id}`)
      ]);

      const allTutorCourses = tutorCoursesRes.data || [];
      const orders = ordersRes.data || [];

      // Lấy danh sách courseId đã đăng ký
      const enrolledCourseIds = new Set();
      orders.forEach(order => {
        // Hỗ trợ cả cấu trúc cũ (items) và mới (tutorCoursesID)
        if (order.tutorCoursesID) {
          enrolledCourseIds.add(order.tutorCoursesID.toString());
        } else if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const courseId = item.foodId || item.id;
            if (courseId) {
              enrolledCourseIds.add(courseId.toString());
            }
          });
        }
      });

      // Lọc các khóa học: chưa full và chưa được user đăng ký
      const availableCourses = allTutorCourses.filter(c => {
        const isNotFull = c.status !== 'Full' && c.status !== 'full';
        const isNotEnrolled = !enrolledCourseIds.has(c.id.toString());
        return isNotFull && isNotEnrolled;
      });

      setCourses(availableCourses);
    } catch (error) {
      console.error('Lỗi khi đăng ký khóa học:', error);
      alert('Có lỗi xảy ra khi đăng ký khóa học');
    }
  };

  if (loading) {
    return (
      <Container className="find-tutor-container">
        <div className="text-center mt-5">Đang tải...</div>
      </Container>
    );
  }

  return (
    <Container className="find-tutor-container">
      <h2 className="mb-4">Đăng ký môn học</h2>

      <div className="courses-grid">
        {courses.map((course) => (
          <div className="course-card" key={course.id}>
            <div className="course-body">
              <h5 className="course-name">{course.name}</h5>
              <p className="course-info">
                <strong>Giảng viên:</strong> {getTutorName(course.tutorId)}
              </p>
              <p className="course-info">
                <strong>Phòng học:</strong> {course.address || '—'}
              </p>
              <p className="course-info">
                <strong>Lịch học:</strong> {course.openTime}
              </p>
              <p className="course-info">
                <strong>Trạng thái:</strong>{' '}
                <span className={course.status === 'Còn trống' ? 'status-available' : 'status-full'}>
                  {course.status}
                </span>
              </p>
              <div className="course-actions">
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => setSelectedCourse(course)}
                >
                  <FaEye /> Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="text-center mt-4 text-muted">Không có khóa học nào.</div>
        )}
      </div>

      {selectedCourse && (() => {
        const tutor = getTutorInfo(selectedCourse.tutorId);
        return (
          <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedCourse.name}</h2>
              <div className="modal-image-container">
                <img src={selectedCourse.image || 'images/courses/default.png'} alt={selectedCourse.name} />
              </div>
              <p>
                <strong>Giảng viên:</strong> {tutor?.name || tutor?.fullName || tutor?.username || "Chưa cập nhật"}
              </p>
              <p>
                <strong>Phòng học:</strong> {tutor?.address || "Chưa có"}
              </p>
              <p>
                <strong>Điện thoại:</strong> {tutor?.phone || "Chưa có"}
              </p>
              <p>
                <strong>Thời gian:</strong> {selectedCourse.openTime || "Chưa rõ"}{" "}
              </p>
              <p>
                <strong>Tình trạng:</strong> {selectedCourse.status || "Chưa có"}
              </p>
              <div className="modal-buttons">
                <button 
                  className="close-button"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleRegister(selectedCourse); 
                  }}
                  style={{ backgroundColor: '#28a745', marginRight: '10px' }}
                >
                  Đăng ký
                </button>
                <button onClick={() => setSelectedCourse(null)} className="close-button">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </Container>
  );
};

export default FindTutor;

