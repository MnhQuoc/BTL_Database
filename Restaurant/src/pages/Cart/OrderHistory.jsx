import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Modal } from 'react-bootstrap';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      try {
        const response = await fetch(`http://localhost:3001/orders?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'warning',
      'processing': 'info',
      'delivering': 'primary',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString('vi-VN');
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (orders.length === 0) {
    return <p className="text-center mt-4">Chưa có đơn hàng nào</p>;
  }

  return (
    <Container className="mt-4">
      <h3>Lịch sử đơn hàng</h3>
      <Table responsive className="mt-3" hover>
        <thead>
          <tr>
            <th>Ngày đặt hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr 
              key={order.id} 
              onClick={() => handleRowClick(order)}
              style={{ cursor: 'pointer' }}
            >
              <td>{formatDate(order.orderDate || order.createdAt)}</td>
              <td>{(order.totalAmount || order.total).toLocaleString('vi-VN')}đ</td>
              <td>{getStatusBadge(order.status)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p><strong>Mã đơn hàng:</strong> {selectedOrder.id}</p>
              <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}</p>
              <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
              <p><strong>Tổng tiền:</strong> {(selectedOrder.totalAmount || selectedOrder.total).toLocaleString('vi-VN')}đ</p>
              {selectedOrder.items && (
                <>
                  <h5 className="mt-3">Danh sách món ăn:</h5>
                  <Table>
                    <thead>
                      <tr>
                        <th>Tên món</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
              {selectedOrder.address && (
                <p><strong>Địa chỉ giao hàng:</strong> {selectedOrder.address}</p>
              )}
              {selectedOrder.phone && (
                <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default OrderHistory;