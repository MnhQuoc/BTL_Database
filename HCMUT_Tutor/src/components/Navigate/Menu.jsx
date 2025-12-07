import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router';
import { FaEye } from 'react-icons/fa';
import './Menu.css';

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [tutorCourses, setTutorCourses] = useState([]);
  const [courses, setCourses] = useState([]); // Store courses for getting all tutors
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [weekView, setWeekView] = useState('this'); // 'first', 'this', 'last'
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy query param search từ URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';

  // Hàm chuẩn hóa chuỗi (bỏ dấu, đổi về chữ thường)
  const normalizeString = (str) => {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || '');
    }
  }, []);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await axios.get('http://localhost:3001/courses');
        let data = res.data;

        // Nếu có search → lọc theo name
        if (searchQuery) {
          const normalizedSearch = normalizeString(searchQuery);
          data = data.filter((food) =>
            normalizeString(food.name).includes(normalizedSearch)
          );
        }

        setFoods(data);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
      }
    };

    fetchFoods();
  }, [searchQuery]);

  useEffect(() => {
    if (userRole !== 'admin') return;

    const fetchAdminData = async () => {
      try {
        // Fetch users (required)
        let usersRes;
        try {
          usersRes = await axios.get('http://localhost:3001/users');
        } catch (err) {
          console.error('Error fetching users:', err);
          usersRes = { data: [] };
        }
        
        // Try to fetch tutorCourses first, fallback to courses if not available
        let tutorCoursesData = [];
        let coursesData = [];
        try {
          const tutorCoursesRes = await axios.get('http://localhost:3001/tutorCourses');
          tutorCoursesData = tutorCoursesRes.data || [];
        } catch (err) {
          console.warn('tutorCourses endpoint not found, trying courses...');
        }
        
        // Also fetch courses to get all tutors (for dropdown)
        try {
          const coursesRes = await axios.get('http://localhost:3001/courses');
          coursesData = coursesRes.data || [];
        } catch (coursesErr) {
          console.warn('Error fetching courses:', coursesErr);
        }
        
        // If tutorCourses is empty or has less data, use courses as fallback
        if (tutorCoursesData.length === 0 && coursesData.length > 0) {
          tutorCoursesData = coursesData;
        }
        
        // Fetch orders (optional - may not exist)
        let ordersRes;
        try {
          ordersRes = await axios.get('http://localhost:3001/orders');
        } catch (err) {
          // Orders endpoint may not exist, that's okay
          ordersRes = { data: [] };
        }
        
        const usersData = usersRes.data || [];
        const ordersData = ordersRes.data || [];
        
        setTutorCourses(tutorCoursesData);
        setCourses(coursesData); // Store courses for getting all tutors
        setUsers(usersData);
        setOrders(ordersData);
        
        // Set first tutor and first class as selected by default
        if (tutorCoursesData.length > 0) {
          // Find first course that has a tutorId
          const firstCourseWithTutor = tutorCoursesData.find(c => c.tutorId);
          if (firstCourseWithTutor) {
            const tutorId = firstCourseWithTutor.tutorId.toString();
            setSelectedTutorId(tutorId);
            setSelectedClass(firstCourseWithTutor);
          } else {
            // If no course has tutorId, just set first course
            setSelectedClass(tutorCoursesData[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        // Set empty arrays to prevent crashes
        setTutorCourses([]);
        setUsers([]);
        setOrders([]);
      }
    };

    fetchAdminData();
  }, [userRole]);

  // Get week dates based on weekView
  const weekDates = useMemo(() => {
    const date = new Date(currentDate);
    let startOfWeek;
    
    if (weekView === 'first') {
      // First week of month
      startOfWeek = new Date(date.getFullYear(), date.getMonth(), 1);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
    } else if (weekView === 'last') {
      // Last week of month
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const day = lastDay.getDay();
      startOfWeek = new Date(lastDay);
      startOfWeek.setDate(lastDay.getDate() - (day === 0 ? 0 : day - 1));
    } else {
      // This week
      const day = date.getDay();
      startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    }

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentDate, weekView]);

  // Parse schedule from openTime - can have multiple days
  const parseSchedule = (openTime) => {
    if (!openTime) return [];
    const parts = openTime.split(' - ');
    if (parts.length < 2) return [];
    
    const dayPart = parts[0].replace('Thứ ', '').trim();
    const timePart = parts[1].trim();
    
    // Handle multiple days (e.g., "Thứ 2, 4, 6")
    const days = dayPart.split(',').map(d => d.trim());
    const dayMap = { '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, 'CN': 0, 'Chủ Nhật': 0 };
    
    return days.map(day => {
      const dayNum = dayMap[day] !== undefined ? dayMap[day] : (parseInt(day) - 1);
      return { day: dayNum, time: timePart };
    });
  };

  // Get tutor name
  const getTutorName = (tutorId) => {
    const tutor = users.find(u => u.id === tutorId?.toString());
    return tutor?.fullName || tutor?.name || tutor?.username || '—';
  };

  // Get student name from orders
  const getStudentName = (tutorCourse) => {
    if (!tutorCourse || !tutorCourse.tutorId) return '—';
    
    // Find order that matches this tutor course
    const matchingOrder = orders.find(order => 
      order.tutorId === tutorCourse.tutorId.toString() &&
      order.items && order.items.some(item => {
        // Check if order item matches the course
        const courseId = item.foodId || item.id;
        return courseId && tutorCourse.id && courseId.toString() === tutorCourse.id.toString();
      })
    );
    
    if (matchingOrder && matchingOrder.userId) {
      const student = users.find(u => u.id === matchingOrder.userId.toString());
      return student?.fullName || student?.name || student?.username || '—';
    }
    
    return '—';
  };

  // Get class code (simplified - using first 3 letters of subject + id)
  const getClassCode = (course) => {
    if (!course) return '—';
    const subject = course.name || '';
    const code = subject.substring(0, 3).toUpperCase() + (course.id?.substring(0, 2) || '1');
    return code.toLowerCase();
  };

  // Get list of tutors from courses (to show all available tutors)
  const tutors = useMemo(() => {
    // Return all tutors with role 'tutor' - show all tutors, not just those with courses
    return users.filter(u => u.role === 'tutor');
  }, [users]);

  // Get classes for selected tutor
  const tutorClasses = useMemo(() => {
    if (!selectedTutorId) return [];
    return tutorCourses.filter(course => 
      course.tutorId && course.tutorId.toString() === selectedTutorId
    );
  }, [selectedTutorId, tutorCourses]);

  // Handle tutor selection
  const handleTutorChange = (tutorId) => {
    setSelectedTutorId(tutorId);
    const classes = tutorCourses.filter(course => course.tutorId === tutorId);
    if (classes.length > 0) {
      setSelectedClass(classes[0]);
    } else {
      setSelectedClass(null);
    }
  };

  if (userRole === 'admin') {
    const schedules = selectedClass ? parseSchedule(selectedClass.openTime) : [];
    
    return (
      <div className="admin-course-layout">
        <aside className="admin-course-sidebar">
          {/* Sidebar empty as requested - no download button, no student section */}
        </aside>

        <section className="admin-course-content">
          {selectedClass ? (
            <>
              <div className="admin-class-details">
                <h2 className="admin-class-code">MÃ LỚP: {getClassCode(selectedClass)}</h2>
                
                <div className="admin-class-info-grid">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Môn học</span>
                    <span className="admin-info-value">{selectedClass.name || '—'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Hình thức học</span>
                    <span className="admin-info-value">
                      {selectedClass.learningMethod 
                        ? (selectedClass.learningMethod === 'online' ? 'Online' : 'Offline')
                        : (selectedClass.location ? 'Offline' : 'Online')
                      }
                    </span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Tutor</span>
                    <select
                      className="admin-tutor-select"
                      value={selectedTutorId}
                      onChange={(e) => handleTutorChange(e.target.value)}
                    >
                      {tutors.map(tutor => (
                        <option key={tutor.id} value={tutor.id.toString()}>
                          {tutor.fullName || tutor.name || tutor.username || '—'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Tình trạng</span>
                    <span className="admin-info-value">
                      {selectedClass.status === 'Còn trống' ? 'Chưa hoàn thành' : selectedClass.status || 'Chưa hoàn thành'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-calendar-section">
                <div className="admin-month-year">
                  Lịch dạy
                </div>

                <div className="admin-calendar-grid">
                  {weekDates.map((date, idx) => {
                    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                    const dayName = dayNames[date.getDay()];
                    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const daySchedule = schedules.find(s => s.day === date.getDay());
                    
                    return (
                      <div key={idx} className="admin-calendar-day">
                        <div className="admin-day-header">
                          <div>{dayName}</div>
                          <div className="admin-day-date">{dateStr}</div>
                        </div>
                        <div className="admin-day-slot">
                          {daySchedule && (
                            <div className="admin-schedule-item">
                              <div className="admin-schedule-time">{daySchedule.time}</div>
                              <button className="admin-registered-btn">Đã ĐK</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="admin-no-class">Chưa có lớp học nào</div>
          )}
        </section>
      </div>
    );
  }
}

export default Menu;
