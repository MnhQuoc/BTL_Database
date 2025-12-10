import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router";




function Signup() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    availability: '',
  });

  const [errors, setErrors] = useState({
    restname: '',
    address: '',
    phone: '',
    email: '',
    time: '',
  });
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    // Kiểm tra đăng nhập
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    // Lấy thông tin user từ API
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(userStr);
        const response = await fetch(`http://localhost:3001/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setForm({
              name: data.name || data.restname || '',
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || '',
              availability: data.time || ''
            });
          // Kiểm tra và hiển thị thông báo nếu thông tin chưa đầy đủ
          if (!data.email || !data.name || !data.phone || !data.address) {
            setMessage('Vui lòng cập nhật thông tin');
          }
        } else {
          setMessage('Không thể tải thông tin người dùng');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage('Có lỗi xảy ra khi tải thông tin');
      }
    };

    fetchUserData();
  }, [navigate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMessage = '';

    if (name === 'restname' && value.trim() === '') {
      errorMessage = 'Họ và tên không được để trống';
    }
    if (name === 'address' && value.trim() === '') {
      errorMessage = 'Địa chỉ không được để trống';
    }
    if (name === 'phone') {
      const phonePattern = /^[0-9]{10,11}$/;
      if (!phonePattern.test(value)) {
        errorMessage = 'Số điện thoại phải là 10 hoặc 11 chữ số';
      }
    }
    if (name === 'email') {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailPattern.test(value)) {
        errorMessage = 'Email không hợp lệ';
      }
    }
    if (name === 'time' && value.trim() === '') {
      errorMessage = 'Giờ mở cửa không được để trống ';
    }

    setErrors({
      ...errors,
      [name]: errorMessage,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra xem có lỗi nào không
    const hasErrors = Object.values(errors).some((error) => error !== '');
    if (hasErrors) {
      return; // Nếu có lỗi, không gửi form
    }

    // Lấy userID từ localStorage (giả sử đã lưu user sau khi đăng nhập)
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setMessage('Bạn cần đăng nhập để cập nhật thông tin');
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id; // Lấy userId từ thông tin user trong localStorage

    // Tạo đối tượng chứa dữ liệu cập nhật
    const updatedUser = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      availability: form.availability,
    };

    try {
      // Cập nhật thông tin người dùng trong DB
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const data = await response.json();
  setMessage('Đăng ký trở thành Staff thành công');
        // Gửi yêu cầu tới admin để duyệt
        const approvalRequest = {
          userId: userId,
          status: 'pending', // Trạng thái yêu cầu đang chờ duyệt
          role: 'staff',
          verified: false,
        };

        // Gửi yêu cầu duyệt
        await fetch('http://localhost:3001/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(approvalRequest),
        });
        setShowConfirmBox(true);

        console.log('Thông tin người dùng đã được cập nhật và yêu cầu duyệt đã gửi');
      } else {
        setMessage('Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2 className="mb-4 text-center">Đăng ký thành viên</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
            <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Họ và tên / Tên hiển thị</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Địa chỉ</label>
          <input
            type="text"
            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          {errors.address && <div className="invalid-feedback">{errors.address}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Số điện thoại</label>
          <input

            type="text"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Lịch giảng / Khung giờ</label>
          <input
            type="text"
            className={`form-control ${errors.availability ? 'is-invalid' : ''}`}
            name="availability"
            value={form.availability}
            onChange={handleChange}
          />
          {errors.availability && <div className="invalid-feedback">{errors.availability}</div>}
        </div>

        <button type="submit" className="btn btn-primary btn-block">Đăng ký</button>
      </form>

      {showConfirmBox && (
          <div className="alert alert-success mt-4">
            <h5 className="alert-heading">Yêu cầu đã được gửi!</h5>
            <p>
              Yêu cầu đăng ký trở thành Tutor của bạn đã được gửi. Xin vui lòng chờ xét duyệt từ quản trị viên.
            </p>
          </div>
      )}
    </div>
  );
}

export default Signup;
