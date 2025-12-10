import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:3001";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        // Lấy chi tiết đơn hàng
        const resOrder = await axios.get(`${API_URL}/orders/${orderId}`);
        setOrder(resOrder.data);

        // Lấy thông tin khách hàng từ đơn hàng
        const resCustomer = await axios.get(`${API_URL}/users/${resOrder.data.customerId}`);
        setCustomer(resCustomer.data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng:", error);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  if (!order || !customer) return <div>Đang tải dữ liệu...</div>;


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng</h1>

      <div className="mb-6 space-y-2">
        <div><strong>Mã đơn hàng:</strong> {order.id}</div>
        <div><strong>Ngày đặt hàng:</strong> {new Date(order.createdAt).toLocaleString()}</div>
        <div><strong>Thời gian giao dự kiến:</strong> {order.estimatedDeliveryTime || "Không rõ"}</div>
        <div><strong>Trạng thái:</strong> {order.status}</div>
        <div><strong>Tên khách:</strong> {customer.username}</div>
        <div><strong>Số điện thoại:</strong> {customer.phone}</div>
        <div><strong>Địa chỉ giao hàng:</strong> {order.deliveryAddress}</div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Danh sách món đã đặt:</h2>
      <table className="w-full border text-left mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Sản phẩm</th>
            <th className="p-2">Số lượng</th>
            <th className="p-2">Đơn giá</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2">
        <div><strong>Tổng tiền hàng:</strong> {calculateSubtotal().toLocaleString()}đ</div>
        <div><strong>Phí giao hàng:</strong> {order.deliveryFee ? `${order.deliveryFee.toLocaleString()}đ` : "0đ"}</div>
        <div><strong>Phí dịch vụ:</strong> {order.serviceFee ? `${order.serviceFee.toLocaleString()}đ` : "0đ"}</div>
        <div><strong>Giảm giá:</strong> {order.discount ? `-${order.discount.toLocaleString()}đ` : "0đ"}</div>
        <div className="text-lg font-bold">
          Tổng thanh toán: {(calculateSubtotal() + (order.deliveryFee || 0) + (order.serviceFee || 0) - (order.discount || 0)).toLocaleString()}đ
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
