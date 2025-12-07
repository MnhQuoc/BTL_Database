import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MainContent.css";
import axios from "axios";

// Accepts optional onSelectProduct(product) prop. If provided the parent
// can show a modal; otherwise MainContent will navigate to the detail page.
const MainContent = ({ onSelectProduct }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.state?.title || "";

  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    // Lấy testimonials và users từ db.json
    Promise.all([
      axios.get('http://localhost:3001/testimonials'),
      axios.get('http://localhost:3001/users')
    ])
      .then(([testimonialsRes, usersRes]) => {
        const usersMap = {};
        usersRes.data.forEach(user => {
          // Đảm bảo id là string để match chính xác
          usersMap[String(user.id)] = user;
        });

        // Map testimonials với thông tin user
        const testimonialsWithUserInfo = testimonialsRes.data.map(testimonial => {
          // Đảm bảo userId là string
          const userId = String(testimonial.userId);
          const user = usersMap[userId];
          
          if (user) {
            // Lấy semester từ testimonial nếu có, nếu không thì tính toán
            const semester = testimonial.semester || (() => {
              const currentYear = new Date().getFullYear();
              const age = currentYear - (user.birthYear || 2000);
              const yearLevel = age >= 18 ? Math.floor((age - 18) / 4) + 1 : 1;
              return `HK${currentYear.toString().substring(2)}${yearLevel}`;
            })();
            
            // Ưu tiên fullName, sau đó name, cuối cùng là username
            const fullName = user.fullName || user.name || user.username;
            
            return {
              ...testimonial,
              name: fullName,
              semester: semester,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0d6efd&color=fff&size=128`
            };
          }
          
          // Nếu không tìm thấy user, vẫn trả về testimonial nhưng có thể không có name
          console.warn(`Không tìm thấy user với userId: ${testimonial.userId}`);
          return testimonial;
        });

        setTestimonials(testimonialsWithUserInfo);
      })
      .catch(err => console.error('Lỗi khi fetch testimonials:', err));
  }, []);

  return (
    <>
      <h2 className="deal-title">{title}</h2>
      <div className="testimonials-section">
        <div className="testimonials-header">
          <h3 className="section-subtitle">TESTIMONIALS</h3>
          <h2 className="section-title">Student Reviews</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div className="testimonial-card" key={t.id}>
              <h3 className="testimonial-title">{t.title}</h3>
              <div className="testimonial-rating">{Array.from({length:5}).map((_,i)=> (
                <span key={i} className={`star ${i < t.rating ? 'filled' : ''}`}>★</span>
              ))}</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <img src={t.avatar} alt={t.name} className="author-avatar" />
                <div className="author-info">
                  <div className="author-name">{t.name}</div>
                  <div className="author-status">{t.semester}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MainContent;
