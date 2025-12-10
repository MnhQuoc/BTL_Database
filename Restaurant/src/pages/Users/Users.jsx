import React, { useState, useEffect } from 'react';
import './Users.css';
import { useNavigate } from 'react-router';

const Users = () => {
  const [formData, setFormData] = useState({
    fullMame: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    streetAddress: ''
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra đăng nhập
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    // Lấy thông tin hiện tại của user
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(userStr);
        const response = await fetch(`http://localhost:3001/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            city: data.city || '',
            district: data.district || '',
            ward: data.ward || '',
            streetAddress: data.streetAddress || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng chọn Tỉnh/thành phố';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'Vui lòng chọn Quận/huyện';
    }
    
    if (!formData.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn Phường/xã';
    }
    
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Vui lòng nhập địa chỉ cụ thể';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage('Vui lòng kiểm tra lại thông tin');
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
        body: JSON.stringify({
          ...formData,
          address: `${formData.streetAddress}, ${formData.ward}, ${formData.district}, ${formData.city}`
        }),
      });

      if (response.ok) {
        setMessage('Cập nhật thông tin thành công!');
        // Chuyển về trang Profile sau 2 giây
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setMessage('Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      setMessage('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  return (
    <div className="users-container">
      <div className="users-content">
        <h2>Thay đổi thông tin liên hệ</h2>
        
        {message && (
          <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label style={{textAlign: 'left', display: 'block'}}>Tên (*)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label style={{textAlign: 'left', display: 'block'}}>Số điện thoại (*)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label style={{textAlign: 'left', display: 'block'}}>Tỉnh/thành phố (*)</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`form-control ${errors.city ? 'is-invalid' : ''}`}
            />
            {errors.city && <div className="invalid-feedback">{errors.city}</div>}
          </div>

          <div className="form-group">
            <label style={{textAlign: 'left', display: 'block'}}>Quận/huyện (*)</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className={`form-control ${errors.district ? 'is-invalid' : ''}`}
            />
            {errors.district && <div className="invalid-feedback">{errors.district}</div>}
          </div>

          <div className="form-group">
            <label style={{textAlign: 'left', display: 'block'}}>Phường/xã (*)</label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              className={`form-control ${errors.ward ? 'is-invalid' : ''}`}
            />
            {errors.ward && <div className="invalid-feedback">{errors.ward}</div>}
          </div>

          <div className="form-group">
            <label style={{textAlign: 'left', display: 'block'}}>Tên đường, Tòa nhà, Số nhà (*)</label>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              className={`form-control ${errors.streetAddress ? 'is-invalid' : ''}`}
            />
            {errors.streetAddress && <div className="invalid-feedback">{errors.streetAddress}</div>}
          </div>

          <button type="submit" className="btn btn-primary">Lưu thông tin</button>
        </form>
      </div>
    </div>
  );
};

export default Users;