import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import './Reports.css';

const Reports = () => {
  const [userRole, setUserRole] = useState('');
  const [courses, setCourses] = useState([]);
  const [tutorCourses, setTutorCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('progress'); // 'overview' or 'progress'
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || '');
      if (user.role !== 'admin') {
        navigate('/home');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (userRole !== 'admin') return;

    const fetchData = async () => {
      try {
        // Fetch all required data
        const [coursesRes, menuRes, usersRes] = await Promise.allSettled([
          axios.get('http://localhost:3001/courses'),
          axios.get('http://localhost:3001/menu'),
          axios.get('http://localhost:3001/users')
        ]);

        // Fetch orders (optional)
        let ordersRes;
        try {
          ordersRes = await axios.get('http://localhost:3001/orders');
        } catch (err) {
          ordersRes = { data: [] };
        }

        const coursesData = coursesRes.status === 'fulfilled' 
          ? (coursesRes.value.data || [])
          : [];
        const tutorCoursesData = tutorCoursesRes.status === 'fulfilled'
          ? (tutorCoursesRes.value.data || [])
          : [];
        const usersData = usersRes.status === 'fulfilled'
          ? (usersRes.value.data || [])
          : [];
        const ordersData = ordersRes.data || [];

        setCourses(coursesData);
        setTutorCourses(tutorCoursesData);
        setUsers(usersData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      }
    };

    fetchData();
  }, [userRole]);

  // Get tutor name
  const getTutorName = (tutorId) => {
    if (!tutorId) return '—';
    const tutor = users.find(u => u.id === tutorId.toString());
    return tutor?.fullName || tutor?.name || tutor?.username || '—';
  };

  // Generate report data
  const reportData = useMemo(() => {
    if (activeTab === 'progress') {
      // Báo cáo tiến độ và kết quả học tập sinh viên
      // Hiển thị tất cả khóa học từ tutorCourses
      const data = [];
      
      tutorCourses.forEach((course, index) => {
        data.push({
          stt: index + 1,
          courseName: course.name || '—',
          tutor: getTutorName(course.tutorId),
          status: course.status || '—',
          sessionsAttended: '—', // Placeholder - can be calculated from attendance data
          sessionsAbsent: '—' // Placeholder
        });
      });

      return data;
    } else {
      // Thống kê tổng quan khóa học
      return [];
    }
  }, [tutorCourses, users, activeTab]);

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="reports-layout">
      <aside className="reports-sidebar">
        <nav className="reports-sidebar-menu">
          <button
            type="button"
            className={`reports-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Thống kê tổng quan khóa học
          </button>
          <button
            type="button"
            className={`reports-nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Báo cáo tiến độ và kết quả học tập sinh viên
          </button>
        </nav>
      </aside>

      <section className="reports-content">
        <header className="reports-header">
          <h1 className="reports-title">
            {activeTab === 'overview' 
              ? 'Thống kê tổng quan khóa học'
              : 'Báo cáo tiến độ học tập'
            }
          </h1>
        </header>

        <div className="reports-table-card">
          {activeTab === 'progress' ? (
            <div className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Khóa học</th>
                    <th>Tutor</th>
                    <th>Trạng thái môn học</th>
                    <th>Số buổi học</th>
                    <th>Số buổi nghỉ</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="reports-empty">
                        Chưa có dữ liệu để hiển thị
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row) => (
                      <tr key={row.stt}>
                        <td>{row.stt}</td>
                        <td>{row.courseName}</td>
                        <td>{row.tutor}</td>
                        <td>{row.status}</td>
                        <td>{row.sessionsAttended}</td>
                        <td>{row.sessionsAbsent}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="reports-overview">
              <p>Thống kê tổng quan khóa học sẽ được hiển thị ở đây</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reports;

