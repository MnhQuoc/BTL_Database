import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router";

export default function ChangeInfo() {
    const [form, setForm] = useState({
        restname: '',
        address: '',
        phone: '',
        email: '',
        time: '',
    });

    const [errors, setErrors] = useState({
        restname: '',
        address: '',
        phone: '',
        email: '',
        time: '',
    });
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
                        restname: data.restname,
                        email: data.email || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        time:data.time || ''
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
        // Kiểm tra lỗi trước khi submit
        let hasError = false;
        Object.entries(form).forEach(([key, value]) => {
            validateField(key, value);
            if (!value || errors[key]) {
                hasError = true;
            }
        });
        if (hasError) {
            setMessage('Vui lòng điền đầy đủ thông tin hợp lệ!');
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
                body: JSON.stringify(form),
            });

            if (response.ok) {
                setMessage('Thông tin đã được cập nhật thành công!');
            } else {
                setMessage('Có lỗi xảy ra khi cập nhật thông tin.');
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage('Đã xảy ra lỗi hệ thống.');
        }
    }
    return (
        <>
            <div className="container mt-5" style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
                <h3 className="mb-4 text-center">Thay đổi thông tin cửa hàng</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Tên cửa hàng </label>
                        <input
                            type="text"
                            className={`form-control ${errors.restname ? 'is-invalid' : ''}`}
                            name="restname"
                            value={form.restname}
                            onChange={handleChange}
                        />
                        {errors.restname && <div className="invalid-feedback">{errors.restname}</div>}
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
                        <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>Giờ đóng - mở cửa </label>
                        <input
                            type="text"
                            className={`form-control ${errors.time ? 'is-invalid' : ''}`}
                            name="time"
                            value={form.time}
                            onChange={handleChange}
                        />
                        {errors.time && <div className="invalid-feedback">{errors.time}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">Cập nhật</button>
                </form>
            </div>
        </>
    )
}