import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const AddressModal = ({ show, handleClose, handleSave }) => {
  const [addressDetails, setAddressDetails] = useState({
    addressType: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    recipientName: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave(addressDetails);
    handleClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddressDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Thêm địa chỉ mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Loại địa chỉ</Form.Label>
            <Form.Select
              name="addressType"
              value={addressDetails.addressType}
              onChange={handleChange}
              required
            >
              <option value="">Chọn loại địa chỉ</option>
              <option value="home">Nhà riêng</option>
              <option value="office">Văn phòng</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tên người nhận</Form.Label>
            <Form.Control
              type="text"
              name="recipientName"
              value={addressDetails.recipientName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={addressDetails.phone}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ chi tiết</Form.Label>
            <Form.Control
              type="text"
              name="street"
              value={addressDetails.street}
              onChange={handleChange}
              placeholder="Số nhà, tên đường"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phường/Xã</Form.Label>
            <Form.Control
              type="text"
              name="ward"
              value={addressDetails.ward}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quận/Huyện</Form.Label>
            <Form.Control
              type="text"
              name="district"
              value={addressDetails.district}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tỉnh/Thành phố</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={addressDetails.city}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Lưu địa chỉ
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddressModal;