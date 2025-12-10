// src/pages/OrderList/OrderItem.jsx
import React, { useState } from "react";
import { updateOrderStatus } from "../../services/orderService";
import { useNavigate } from "react-router-dom";

const OrderItem = ({ order, onStatusUpdate }) => {
  const [status, setStatus] = useState(order.status);
  const navigate = useNavigate();

  const handleAccept = async () => {
    await updateOrderStatus(order.id, "Đang chế biến");
    setStatus("Đang chế biến");
    onStatusUpdate(order.id, "Đang chế biến");
  };

  const handleReject = async () => {
    await updateOrderStatus(order.id, "Hủy");
    setStatus("Hủy");
    onStatusUpdate(order.id, "Hủy");
  };

  const handleDetail = () => {
    navigate(`/merchant/order-detail/${order.id}`);
  };

  return (
    <div className="order-item border p-3 mb-3 rounded">
      <p><strong>Thời gian đặt:</strong> {order.orderTime}</p>
      <p><strong>Người đặt:</strong> {order.customerName}</p>
      <p><strong>Tổng món:</strong> {order.totalItems}</p>
      <p><strong>Trạng thái:</strong> {status}</p>

      {status === "Chờ nhận hàng" && (
        <div className="flex gap-2 mt-2">
          <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={handleAccept}>
            Nhận đơn
          </button>
          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleReject}>
            Hủy đơn
          </button>
        </div>
      )}

      <button className="bg-blue-500 text-white px-3 py-1 rounded mt-2" onClick={handleDetail}>
        Xem chi tiết
      </button>
    </div>
  );
};

export default OrderItem;
