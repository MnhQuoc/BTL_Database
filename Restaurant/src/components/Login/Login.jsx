import React, { useState } from 'react';
import { useNavigate } from 'react-router';

function Login({ setIsLoggedIn }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Thêm loading để quản lý trạng thái gửi
  const navigate = useNavigate();

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

    if (name === 'username') {
      if (value.trim() === '') {
        errorMessage = 'Tên đăng nhập không được để trống';
      }
    }

    if (name === 'password') {
      if (value.trim() === '') {
        errorMessage = 'Mật khẩu không được để trống';
      }
    }

    setErrors({
      ...errors,
      [name]: errorMessage,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Object.keys(form).forEach((field) => validateField(field, form[field]));
    if (Object.values(errors).some((error) => error !== '')) {
      setMessage('Vui lòng sửa lỗi trước khi gửi');
      return;
    }
    setLoading(true); // Bắt đầu trạng thái loading

    setLoading(true); // Bắt đầu trạng thái loading

    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'GET',
      });
      const users = await response.json();

      // Tìm user phù hợp
      const user = users.find(
        (u) => u.username === form.username && u.password === form.password
      );

      if (user) {
        // Kiểm tra tài khoản đã được xác nhận chưa
        if (!user.verified) {
          setMessage('Vui lòng xác nhận tài khoản');
          return;
        }

        // Lưu thông tin user vào localStorage
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            username: user.username,
            role: user.role,
          })
        );

        setMessage('Đăng nhập thành công!');
        // Reset form
        setForm({
          username: '',
          password: '',
        });

        // Chuyển hướng đến trang chủ sau 1 giây
        setTimeout(() => {
          navigate('/home');  
          window.location.reload(); // Thêm dòng này để reload trang       
        }, 1000);
      } else {
        setMessage('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };

  return (
    <div
      className="container"
      style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}
    >
      <h2 className="text-center">Đăng nhập</h2>
      {message && <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'} mt-3`}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="form-control"
            placeholder="Nhập tên đăng nhập của bạn"
            required
          />
           {errors.username && <p className="text-danger">{errors.username}</p>}
        </div>
        <div className="form-group">
          <label >Mật khẩu:</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="form-control"
            placeholder="Nhập mật khẩu của bạn"
            required
          />
          {errors.password && <p className="text-danger">{errors.password}</p>}
        </div>
        <button
          type="submit"
          className="btn pill-btn w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm ms-2"
                role="status"
                aria-hidden="true"
              ></span>
              &nbsp; Đang đăng nhập
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>
      <div className="mt-4 text-center">
        <span>Bạn chưa có tài khoản?</span>
        <button
          type="button"
          className="btn btn-link"
          onClick={() => navigate('/register')}
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
}

export default Login;
