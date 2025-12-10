import React from 'react';
import './Footer.css';
import {
  FaFacebook,
  FaGooglePlusSquare, 
  FaInstagramSquare,  
  FaTwitterSquare, 
} from 'react-icons/fa';



const Footer = () => {

  const founders = [
    {
      name: '1',
      img: '/images/person_1.jpg',
    },
    {
      name: '2',
      img: '/images/person_2.jpg',
    },
    {
      name: '3',
      img: '/images/person_3.jpg',
    },
    {
      name: '4',
      img: '/images/person_4.jpg',
    },
    {
      name: '5',
      img: '/images/person_5.jpg',
    },
    {
      name: '6',
      img: '/images/person_1.jpg',
    },
    {
      name: '7',
      img: '/images/person_2.jpg',
    },
    { 
      name: '8',
      img: '/images/person_3.jpg',
    },
  ];
  return (
    <>
      <footer className="footer-section bg-dark text-light py-5">
        <div className="container">
          <div className="row text-left">
            {/* Column 1 */}
            <div className="col-md-3 mb-4">
              <h6 className="footer-title">Khám phá</h6>
              <ul className="list-unstyled">
                <li><a href="#">Ứng dụng Mobile</a></li>
                <li><a href="#">Tạo bộ sưu tập</a></li>
                <li><a href="#">Bảo mật thông tin</a></li>
                <li><a href="#">Quy định</a></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="col-md-3 mb-4">
              <h6 className="footer-title">Nhà hàng</h6>
              <ul className="list-unstyled">
                <li><a href="#">Giới thiệu</a></li>
                <li><a href="#">Trợ giúp</a></li>
                <li><a>Địa chỉ: 268 Lý Thường Kiệt, phường Diên Hồng, Thành phố Hồ Chí Minh</a></li>
                <li><a>Hotline: 0123 456 789</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="col-md-3 mb-4">
              <h6 className="footer-title">Tham gia trên</h6>
              <ul className="list-unstyled">
                <li><a href="https://www.facebook.com/groups/2725023304306622"><FaFacebook className="me-2" />Facebook</a></li>
                <li><a href="https://www.instagram.com/"><FaInstagramSquare className="me-2" />Instagram</a></li>
                <li><a href="https://hcmut.edu.vn/"><FaGooglePlusSquare className="me-2" />Google</a></li>
                <li><a href="https://www.twitter.com/"><FaTwitterSquare className="me-2" />Twitter</a></li>
              </ul>
            </div>

            {/* Column 4 - Founders */}
            <div className="col-md-3 mb-4">
              <h6 className="footer-title">Assignment Database - Group 8</h6>
              <div className="row founders-grid">
                {founders.map((person, index) => (
                    <div key={index} className="col-3 mb-2 text-center">
                      <img
                          src={person.img}
                          alt={person.name}
                          className="rounded-circle shadow founder-img"
                          style={{ objectFit: 'cover' }}
                      />
                      <div className="mt-2">
                        <strong>{person.name}</strong>
                        <p className="mb-0 small text-muted">{person.role}</p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <hr />
          <div className="d-flex justify-content-between align-items-center small">
            <span>© 2025 BTL CNPM - Nhóm 5</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
