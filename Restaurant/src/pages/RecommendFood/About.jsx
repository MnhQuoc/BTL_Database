import React, { useEffect, useRef, useState } from 'react';
import './About.css';
import axios from 'axios';
import MainContent from '../Content/MainContent';
import { useNavigate } from 'react-router'; // ✅ thêm

const About = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate(); // ✅ thêm

  useEffect(() => {
    // Fetch menu và users
    Promise.all([
      axios.get('http://localhost:3001/menu'),
      axios.get('http://localhost:3001/users')
    ])
      .then(([menuRes, usersRes]) => {
        // Lấy 10 món ăn đầu tiên từ menu
        const menuItems = menuRes.data || [];
        setProducts(menuItems.slice(0, 10));
        setUsers(usersRes.data || []);
      })
      .catch(err => console.error('Lỗi khi fetch data:', err));
  }, []);

  // Lấy thông tin đầu bếp từ tutorId
  const getTutorInfo = (tutorId) => {
    if (!tutorId) return null;
    const tutor = users.find(u => u.id === tutorId.toString());
    return tutor;
  };

  const scrollLeft = () => scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });

  return (
    <>
      <div className="flash-sale-section">
        <div className="flash-sale-header">
          <h2>Các món ăn nổi bật</h2>
          <a href="#" className="view-all">Xem tất cả &gt;</a>
        </div>

        <div className="scroll-container">
          <button className="scroll-btn left" onClick={scrollLeft}>❮</button>
          <div className="product-list" ref={scrollRef}>
            {products.map(product => (
              <div 
                className="product-card" 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className="image-wrap">
                  <img src={product.image} alt={product.name} />
                </div>
                <p className="product-name">{product.name}</p>
              </div>
            ))}
          </div>
          <button className="scroll-btn right" onClick={scrollRight}>❯</button>
        </div>
      </div>

      <MainContent />

      {selectedProduct && (() => {
        const tutor = getTutorInfo(selectedProduct.staffId || selectedProduct.tutorId);
        return (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedProduct.name}</h2>
              <div className="modal-image-container">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>
              <p>
                <strong>Đầu bếp:</strong> {tutor?.name || tutor?.fullName || tutor?.username || "Chưa cập nhật"}
              </p>
              <p>
                <strong>Giá tiền:</strong> {selectedProduct.price ? `${selectedProduct.price.toLocaleString('vi-VN')}đ` : selectedProduct.serviceFee ? `${selectedProduct.serviceFee.toLocaleString('vi-VN')}đ` : "Chưa có"}
              </p>
              <p>
                <strong>Thời gian phục vụ:</strong> {selectedProduct.openTime || selectedProduct.prepareTime ? `${selectedProduct.prepareTime} phút` : "Chưa rõ"}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedProduct.status || "Chưa có"}
              </p>
              <div className="modal-buttons">
                <button onClick={() => setSelectedProduct(null)} className="close-button">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default About;
