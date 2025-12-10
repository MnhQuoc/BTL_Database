import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { FaSave, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const FoodEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/courses/${id}`);
        setFood({
          ...res.data,
          tag: res.data.tag?.join(', '),
        });
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
      }
    };

    fetchFood();
  }, [id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFood((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
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
      throw new Error(data.error?.message || 'Upload thất bại');
    }
    return data.secure_url;
  };

  const handleSave = async () => {
    try {
      let imageUrl = food.image;
      if (image) {
        imageUrl = await uploadToCloudinary(image);
      }

      const updatedFood = {
        ...food,
        image: imageUrl,
        prepareTime: parseInt(food.prepareTime) || 0,
        serviceFee: parseFloat(food.serviceFee) || 0,
        tag: food.tag.split(',').map(t => t.trim()),
      };

      await axios.put(`http://localhost:3001/courses/${id}`, updatedFood);
      setMessage(<><FaCheckCircle className="me-2" /> Cập nhật thành công!</>);
      setIsSuccess(true);
      setTimeout(() => navigate('/listfood'), 1500);
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      const errorMessage = err.response?.data?.error || 'Cập nhật thất bại!';
      setMessage(<><FaTimesCircle className="me-2" /> {errorMessage}</>);
      setIsSuccess(false);
    }

    setTimeout(() => setMessage(''), 6000);
  };

  if (!food) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-center">Chỉnh sửa môn học</h2>

      <div className="alert alert-warning mb-3" role="alert">
        <strong>Lưu ý:</strong> Mỗi tutor chỉ được dạy 1 môn học. Bạn không thể đổi tên môn học nếu đã có môn học khác.
      </div>

      {message && (
        <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>{message}</div>
      )}
<div className="mb-3">
        <label className="form-label">Tên môn học</label>
        <input id="name" value={food.name} onChange={handleChange} className="form-control" />
        <small className="form-text text-muted">Không thể đổi sang môn học khác nếu bạn đã có môn học khác.</small>
      </div>

      <div className="mb-3">
        <label className="form-label">Khung giờ dạy</label>
        <input 
          id="openTime" 
          value={food.openTime || ''} 
          onChange={handleChange} 
          className="form-control"
          placeholder="Ví dụ: Thứ 2, 4, 6 - 7:00-9:00"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Địa chỉ phòng học</label>
        <input id="address" value={food.address} onChange={handleChange} className="form-control" />
      </div>

      <div className="mb-3">
        <label className="form-label">Ảnh môn học</label>
        {image ? (
          <div>
            <img src={URL.createObjectURL(image)} style={{ maxWidth: 200 }} alt="preview" />
          </div>
        ) : food.image && (
          <div>
            <img src={food.image} style={{ maxWidth: 200 }} alt="current" />
          </div>
        )}
        <input type="file" onChange={handleImageChange} className="form-control mt-2" />
      </div>

      <div className="mb-3">
        <label className="form-label">Thời gian chuẩn bị</label>
        <input id="prepareTime" value={food.prepareTime} onChange={handleChange} className="form-control" type="number" />
      </div>


      <div className="mb-3">
        <label className="form-label">Phí dịch vụ</label>
        <input id="serviceFee" value={food.serviceFee} onChange={handleChange} className="form-control" type="number" />
      </div>

      <div className="mb-3">
        <label className="form-label">Ghi chú</label>
        <textarea id="note" value={food.note} onChange={handleChange} className="form-control" />
      </div>

      <div className="mb-3">
        <label className="form-label">Tags (cách nhau bởi dấu phẩy)</label>
        <input id="tag" value={food.tag} onChange={handleChange} className="form-control" />
      </div>

      <div className="d-flex justify-content-between">
        <button className="btn btn-success" onClick={handleSave}>
          <FaSave className="me-2" /> Lưu
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/listfood')}>
          <FaArrowLeft className="me-2" /> Quay lại
        </button>
      </div>
    </div>
  );
};

export default FoodEdit;