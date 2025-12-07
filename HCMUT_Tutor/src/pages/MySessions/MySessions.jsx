import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { FaLightbulb, FaEllipsisH } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './MySessions.css';

const MySessions = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Đang học');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyCourses = async () => {
      try {
        const currentUser = JSON.parse(user);
        if (!currentUser?.id) {
          setLoading(false);
          return;
        }

        const role = currentUser.role || '';
        setUserRole(role);

        // Nếu là tutor: lấy các khóa học mà tutor đang dạy từ tutorCourses
        if (role === 'tutor') {
          const coursesRes = await fetch('http://localhost:3001/tutorCourses');
          const allTutorCourses = await coursesRes.json();
          // Filter courses theo tutorId - chỉ hiển thị 1 môn học với các khung giờ khác nhau
          const tutorCourses = allTutorCourses.filter(course => 
            course.tutorId === currentUser.id.toString()
          );
          setMyCourses(tutorCourses);
          setLoading(false);
          return;
        }

        // Nếu là user: lấy các khóa học đã đăng ký (từ orders)
        const [ordersRes, usersRes] = await Promise.all([
          fetch(`http://localhost:3001/orders?userId=${currentUser.id}`),
          fetch('http://localhost:3001/users')
        ]);
        
        const orders = await ordersRes.json();
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Lấy tất cả courseId từ orders
        const courseIds = [];
        orders.forEach(order => {
          // Hỗ trợ cả cấu trúc cũ (items) và mới (tutorCoursesID)
          if (order.tutorCoursesID) {
            const courseId = order.tutorCoursesID.toString();
            if (!courseIds.includes(courseId)) {
              courseIds.push(courseId);
            }
          } else if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              // Check both foodId (from db.json format) and id (from new orders)
              const courseId = item.foodId || item.id;
              if (courseId && !courseIds.includes(courseId.toString())) {
                courseIds.push(courseId.toString());
              }
            });
          }
        });

        // Fetch tutorCourses thay vì courses vì đăng ký sử dụng tutorCourse.id
        const tutorCoursesRes = await fetch('http://localhost:3001/tutorCourses');
        const allTutorCourses = await tutorCoursesRes.json();

        // Lọc tutorCourses theo courseIds
        const enrolledCourses = allTutorCourses.filter(course => 
          courseIds.includes(course.id.toString())
        );

        setMyCourses(enrolledCourses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching my courses:', error);
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  // Parse schedule từ openTime
  const parseSchedule = (openTime, courseId) => {
    if (!openTime) return [];
    
    // Format: "Thứ 2, 4, 6 - 7:00-9:00" hoặc "Chủ nhật - 7:00-9:00" hoặc "Thứ 2, Chủ nhật - 7:00-9:00"
    const parts = openTime.split(' - ');
    if (parts.length < 2) return [];

    let daysPart = parts[0].trim();
    const timePart = parts[1].trim();
    
    // Xử lý "Chủ nhật" riêng
    const isSundayOnly = daysPart === 'Chủ nhật';
    if (isSundayOnly) {
      daysPart = 'CN';
    } else if (daysPart.startsWith('Thứ ')) {
      daysPart = daysPart.replace('Thứ ', '');
    }
    
    const days = daysPart.split(',').map(d => d.trim());
    const [startTime, endTime] = timePart.split('-').map(t => t.trim());

    // Convert time format (7:00 -> 7:00AM, 13:00 -> 1:00PM)
    const formatTime = (time) => {
      const [hour, minute] = time.split(':');
      const hourNum = parseInt(hour);
      if (hourNum < 12) {
        return `${hourNum}:${minute || '00'}AM`;
      } else if (hourNum === 12) {
        return `12:${minute || '00'}PM`;
      } else {
        return `${hourNum - 12}:${minute || '00'}PM`;
      }
    };

    // Deterministic online/offline based on courseId for consistency
    const isOnline = parseInt(courseId) % 3 !== 0;

    return days.map(day => {
      // Xử lý "Chủ nhật" hoặc "CN"
      const dayDisplay = (day === 'CN' || day === 'Chủ nhật') ? 'Chủ nhật' : `Thứ ${day}`;
      return {
        day: dayDisplay,
        time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        isOnline: isOnline
      };
    });
  };

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
          <h2 className="my-sessions-title">Khóa học của tôi</h2>
        </div>
        
        <div className="filter-dropdown-wrapper">
          <select 
            className="filter-dropdown"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Đang học">
              {userRole === 'tutor' ? 'Đang dạy' : 'Đang học'}
            </option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
            <option value="Tất cả">Tất cả</option>
          </select>
        </div>
      </div>

      {myCourses.length === 0 ? (
        <div className="empty-state">
        <div className="empty-state-card">
          <p className="empty-state-text">Bạn chưa có khoá học nào</p>
          <div className="empty-state-actions">
            {userRole === 'tutor' ? (
              <button 
                className="btn btn-primary btn-lg mt-3"
                onClick={() => navigate('/open-course')}
              >
                Đăng ký mở lớp
              </button>
            ) : (
              <button 
                className="btn btn-primary btn-lg mt-3"
                onClick={() => navigate('/find-tutor')}
              >
                Đăng ký khóa học ngay
              </button>
            )}
          </div>
        </div>
        </div>
      ) : (
        <div className="courses-grid">
          {myCourses.map((course) => {
            const schedules = parseSchedule(course.openTime, course.id);
            
            return (
              <div 
                key={course.id} 
                className={`course-card ${course.id % 2 === 0 ? 'course-card-blue' : 'course-card-purple'}`}
              >
                <div className="course-icon">
                  <FaLightbulb />
                </div>
                <h3 className="course-title">{course.name}</h3>
                <p className="course-instructor">
                  {(() => {
                    const tutor = users.find(u => u.id === course.tutorId?.toString());
                    return tutor?.name || tutor?.fullName || tutor?.username || course.restname || '—';
                  })()}
                </p>
                
                <div className="course-schedules">
                  {schedules.map((schedule, idx) => (
                    <div key={idx} className="schedule-item">
                      <p className="schedule-time">{schedule.day}: {schedule.time}</p>
                      <p className={`schedule-status ${schedule.isOnline ? 'online' : 'offline'}`}>
                        {schedule.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="course-menu">
                  <FaEllipsisH />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default MySessions;

