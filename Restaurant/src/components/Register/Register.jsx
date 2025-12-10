import React, { useState, useEffect } from 'react';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router';

function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    birthYear: '',
    email: '',
    phone: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Thêm loading để quản lý trạng thái gửi
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    fullName: '',
    birthYear: '',
    email: '',
    phone: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: '',
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';

    if (name === 'username' && value.length < 8) {
      errorMessage = 'Tên đăng nhập phải từ 8 ký tự trở lên';
    }

    if (name === 'password' && !/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(value)) {
      errorMessage = 'Mật khẩu phải từ 8 ký tự trở lên và bao gồm cả chữ và số';
    }

    if (name === 'fullName' && value.trim().length < 2) {
      errorMessage = 'Họ tên phải từ 2 ký tự trở lên';
    }

    if (name === 'birthYear') {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        errorMessage = 'Năm sinh không hợp lệ';
      }
    }

    if (name === 'phone' && !/^\d{10}$/.test(value)) {
      errorMessage = 'Số điện thoại phải có 10 số';
    }

    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errorMessage = 'Email không hợp lệ';
    }

    setErrors({
      ...errors,
      [name]: errorMessage,
    });
  };

  const validateForm = () => {
    let valid = true;
    let errorMessages = {};
    
    if (form.username.length < 8) {
      errorMessages.username = 'Tên đăng nhập phải từ 8 ký tự trở lên';
      valid = false;
    }
    
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      errorMessages.password = 'Mật khẩu phải từ 8 ký tự trở lên và bao gồm cả chữ và số';
      valid = false;
    }

    if (form.fullName.trim().length < 2) {
      errorMessages.fullName = 'Họ tên phải từ 2 ký tự trở lên';
      valid = false;
    }

    const year = parseInt(form.birthYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear) {
      errorMessages.birthYear = 'Năm sinh không hợp lệ';
      valid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      errorMessages.phone = 'Số điện thoại phải có 10 số';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      errorMessages.email = 'Email không hợp lệ';
      valid = false;
    }

    setErrors(errorMessages);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!validateForm()) {
      setMessage('Vui lòng sửa các lỗi ở biểu mẫu.');
      setLoading(false);
      return;
    }

    try {
      // Kiểm tra username đã tồn tại
      const usernameRes = await axios.get(
        `http://localhost:3001/users?username=${form.username}`
      );
      console.log('API response:', usernameRes.data);

      if (!Array.isArray(usernameRes.data)) {
        throw new Error('API không trả về mảng dữ liệu');
      }

      if (usernameRes.data.some((user) => user.username === form.username)) {
        setMessage('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
        setLoading(false);
        return;
      }

      // Kiểm tra email đã tồn tại
      const emailRes = await axios.get(
        `http://localhost:3001/users?email=${encodeURIComponent(form.email)}`
      );

      if (Array.isArray(emailRes.data) && emailRes.data.length > 0) {
        // Kiểm tra case-insensitive
        const emailExists = emailRes.data.some(
          (user) => user.email && user.email.toLowerCase() === form.email.toLowerCase()
        );
        
        if (emailExists) {
          setMessage('Email đã được sử dụng. Vui lòng sử dụng email khác.');
          setLoading(false);
          return;
        }
      }

      const newUserId = Date.now();
      const { username, password, fullName, birthYear, email, phone } = form;

      // Đăng ký user mới
      await axios.post('http://localhost:3001/users', {
        id: newUserId,
        username,
        password,
        fullName,
        birthYear: parseInt(birthYear),
        email,
        phone,
        role: 'user',
        blocked: false,
        verified: false,
      });

      // Gửi email xác nhận
      const confirmationLink = `http://localhost:5173/verify/${newUserId}`;

      const templateParams = {
        to_name: username,         
        to_email: email,
        username: username,
        email: email,
        userId: newUserId.toString(),
        verification_link: confirmationLink
      };

      console.log('Sending email with params:', templateParams);

      await emailjs.send(
        'service_vab1tb9', 
        'template_n4skzsu', 
        templateParams, 
        'E_5vA24w2mZlesP04'
      ).then((response) => {
        console.log('✅ Email sent successfully!', response);
        console.log('Response status:', response.status);
        console.log('Response text:', response.text);
      }).catch((error) => {
        console.error('❌ EmailJS Error:', error);
        console.error('Error code:', error.status);
        console.error('Error text:', error.text);
        console.error('Full error:', JSON.stringify(error, null, 2));
        // Vẫn cho phép đăng ký thành công ngay cả khi email lỗi
      });

      setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
      setForm({ username: '', password: '', fullName: '', birthYear: '', email: '', phone: '' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Lỗi:', error);
      setMessage('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center">
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '20px',
          textAlign: 'left',
        }}
      >
        <h2 className="mb-4 text-center">Đăng Ký</h2>
        <p>Các trường có dấu * bắt buộc phải nhập</p>
        {message && <p className="mt-3">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Tên đăng nhập (<span className="text-danger">*</span>):
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập tên đăng nhập của bạn"
              required
            />
            {errors.username && (
              <p className="text-danger">{errors.username}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Mật khẩu (<span className="text-danger">*</span>):
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập mật khẩu của bạn"
              required
            />
            {errors.password && (
              <p className="text-danger">{errors.password}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              Họ tên (<span className="text-danger">*</span>):
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="form-control"
              value={form.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập họ tên của bạn"
              required
            />
            {errors.fullName && (
              <p className="text-danger">{errors.fullName}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="birthYear" className="form-label">
              Năm sinh (<span className="text-danger">*</span>):
            </label>
            <input
              type="number"
              id="birthYear"
              name="birthYear"
              className="form-control"
              value={form.birthYear}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập năm sinh của bạn"
              min="1900"
              max={new Date().getFullYear()}
              required
            />
            {errors.birthYear && (
              <p className="text-danger">{errors.birthYear}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email (<span className="text-danger">*</span>):
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập email của bạn"
              required
            />
            {errors.email && <p className="text-danger">{errors.email}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="phone" className="form-label">
              Số điện thoại (<span className="text-danger">*</span>):
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập số điện thoại của bạn"
              required
            />
            {errors.phone && <p className="text-danger">{errors.phone}</p>}
          </div>

          <button
            type="submit"
            className=" btn pill-btn w-100"
            style={{ padding: '15px' }}
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-4 d-flex justify-content-between align-items-center">
          <span>Bạn đã có tài khoản?</span>
          <button
            type="button"
            className="btn btn-link"
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;