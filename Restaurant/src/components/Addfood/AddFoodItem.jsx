import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';

const AddFoodItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    image: '',
    prepareTime: '',
    note: '',
    serviceFee: '',
    tag: '',
    openTime: ''
  });

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [imagefood, setImagefood] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const uploadToCloudinary = async (file) => {
    const CLOUD_NAME = 'dr1ihrvvg';
    const UPLOAD_PRESET = 'TruaNayAnGi';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      console.error("Cloudinary upload error:", data);
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Lấy thông tin user hiện tại
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setMessage('❌ Vui lòng đăng nhập để thêm môn học!');
        setIsSuccess(false);
        setTimeout(() => setMessage(''), 4000);
        return;
      }

      const user = JSON.parse(userStr);
      if (user.role !== 'tutor') {
        setMessage('❌ Chỉ tutor mới có thể thêm môn học!');
        setIsSuccess(false);
        setTimeout(() => setMessage(''), 4000);
        return;
      }

      let imageUrl = "";
      if (imagefood) {
        imageUrl = await uploadToCloudinary(imagefood);
      }

      const data = {
        ...formData,
        prepareTime: parseInt(formData.prepareTime) || 0,
        serviceFee: parseFloat(formData.serviceFee) || 0,
        tag: formData.tag.split(',').map(tag => tag.trim()),
        image: imageUrl,
        tutorId: user.id.toString(), // Tự động gán tutorId từ user đăng nhập
        openTime: formData.openTime || 'Chưa cập nhật',
        status: 'Còn trống',
        rating: 0,
        location: '',
        phone: user.phone || '',
        category: '',
        restname: user.name || user.username || ''
      };

      await axios.post('http://localhost:3001/courses', data);
      setMessage('✅ Đã thêm môn học thành công!');
      setIsSuccess(true);

      setFormData({
        name: '',
        address: '',
        image: '',
        prepareTime: '',
        note: '',
        serviceFee: '',
        tag: '',
        openTime: ''
      });
      setImagefood(null);
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error('❌ Lỗi khi thêm môn học:', error);
      const errorMessage = error.response?.data?.error || '❌ Thêm môn học thất bại!';
      setMessage(errorMessage);
      setIsSuccess(false);
      setTimeout(() => setMessage(''), 6000);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Thêm Môn Học Mới</h2>

      <div className="alert alert-info mb-3" role="alert">
        <strong>Lưu ý:</strong> Mỗi tutor chỉ được dạy 1 môn học. Bạn có thể thêm nhiều khung giờ khác nhau cho cùng một môn học.
      </div>

      {message && (
        <div
          className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} mt-3`}
          role="alert"
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="text-start">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Tên môn học (*)</label>
          <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange} required />
          <small className="form-text text-muted">Nếu bạn đã có môn học khác, vui lòng sử dụng cùng tên môn học và thêm khung giờ mới.</small>
        </div>

        <div className="mb-3">
          <label htmlFor="openTime" className="form-label">Khung giờ dạy (*)</label>
          <input 
            type="text" 
            className="form-control" 
            id="openTime" 
            value={formData.openTime} 
            onChange={handleChange} 
            placeholder="Ví dụ: Thứ 2, 4, 6 - 7:00-9:00"
            required 
          />
          <small className="form-text text-muted">Nhập khung giờ dạy cho môn học này (ví dụ: Thứ 2, 4, 6 - 7:00-9:00)</small>
        </div>

        <div className="mb-3">
          <label htmlFor="address" className="form-label">Địa chỉ phòng học (*)</label>
          <input type="text" className="form-control" id="address" value={formData.address} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Ảnh món ăn (*)</label>
          <div className="d-flex align-items-center gap-3">
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImagefood(file);
                  const previewUrl = URL.createObjectURL(file);
                  setFormData((prevData) => ({ ...prevData, image: previewUrl }));
                }
              }}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => document.getElementById('imageUpload').click()}
            >
              <FaCamera />
              Chọn ảnh
            </button>
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
              />
            )}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="prepareTime" className="form-label">Thời gian chuẩn bị (phút)</label>
          <input type="number" className="form-control" id="prepareTime" value={formData.prepareTime} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label htmlFor="note" className="form-label">Ghi chú</label>
          <textarea className="form-control" id="note" rows="3" value={formData.note} onChange={handleChange}></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="serviceFee" className="form-label">Phí dịch vụ</label>
          <input type="number" className="form-control" id="serviceFee" value={formData.serviceFee} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label htmlFor="tag" className="form-label">Tag (*) (ngăn cách bằng dấu phẩy)</label>
          <input type="text" className="form-control" id="tag" value={formData.tag} onChange={handleChange} required />
        </div >
        <div className="d-flex justify-content-between gap-2 mt-3">
          <button type="submit" className="btn btn-success flex">
              Thêm môn học
          </button>
          <button type="button" className="btn btn-secondary flex" onClick={() => navigate('/listfood')}>
              Quay lại
        </button>
        </div>

      </form>
    </div>
  );
};

export default AddFoodItem;