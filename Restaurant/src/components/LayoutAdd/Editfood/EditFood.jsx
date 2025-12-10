import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { FaSave, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';

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
    setFood(prev => ({ ...prev, [id]: value }));
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
    if (!response.ok || !data.secure_url) throw new Error(data.error?.message || 'Upload thất bại');
    return data.secure_url;
  };

  const handleSave = async () => {
    try {
      let imageUrl = food.image;
      if (image) imageUrl = await uploadToCloudinary(image);

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
      setMessage(<><FaTimesCircle className="me-2" /> Cập nhật thất bại!</>);
      setIsSuccess(false);
    }
    setTimeout(() => setMessage(''), 4000);
  };

  if (!food) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

  return (
    <div className="container mt-5">
      <Card className="shadow-sm border-0 rounded">
        <Card.Header className="bg-primary text-white text-center">
          <h4>Chỉnh sửa món ăn</h4>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={isSuccess ? 'success' : 'danger'}>{message}</Alert>
          )}

          {/* Ảnh món ăn - đặt đầu tiên */}
          <Form.Group className="mb-4">
            <Form.Label>Ảnh món ăn</Form.Label>
            <div>
              {image ? (
                <img src={URL.createObjectURL(image)} style={{ maxWidth: 200, borderRadius: 8 }} alt="preview" />
              ) : food.image && (
                <img src={food.image} style={{ maxWidth: 200, borderRadius: 8 }} alt="current" />
              )}
              <Form.Control type="file" onChange={handleImageChange} className="mt-2" />
            </div>
          </Form.Group>

          {/* Các thông tin khác */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Tên món ăn</Form.Label>
                <Form.Control type="text" value={food.name} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="address">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control type="text" value={food.address} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="prepareTime">
                <Form.Label>Thời gian chuẩn bị</Form.Label>
                <Form.Control type="number" value={food.prepareTime} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="serviceFee">
                <Form.Label>Phí dịch vụ</Form.Label>
                <Form.Control type="number" value={food.serviceFee} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="tag">
                <Form.Label>Tags (cách nhau bởi dấu phẩy)</Form.Label>
                <Form.Control type="text" value={food.tag} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4" controlId="note">
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control as="textarea" rows={3} value={food.note} onChange={handleChange} />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="success" onClick={handleSave}>
              <FaSave className="me-2" /> Lưu
            </Button>
            <Button variant="secondary" onClick={() => navigate('/listfood')}>
              <FaArrowLeft className="me-2" /> Quay lại
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FoodEdit;
