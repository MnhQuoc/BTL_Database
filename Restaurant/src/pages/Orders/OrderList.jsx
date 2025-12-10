import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders`);
        setOrders(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}`, { status: "Đã hủy" });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: "Đã hủy" } : order
        )
      );
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}`, { status: "Đang chế biến" });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: "Đang chế biến" } : order
        )
      );
    } catch (error) {
      console.error("Lỗi nhận đơn hàng:", error);
    }
  };

  return (
    <div className="container p-4">
      <h1 className="text-center mb-4">Danh sách đơn hàng</h1>
      <table className="table table-bordered table-striped">
        <thead className="thead-light">
          <tr>
            <th>Mã đơn</th>
            <th>Thời gian đặt</th>
            <th>Tên người đặt</th>
            <th>Tổng món</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>{order.customerName}</td>
              <td>{order.items.length}</td>
              <td>{order.totalAmount} VND</td>
              <td>{order.status}</td>
              <td>
                <div className="d-flex gap-2">
                  {order.status === "Chờ nhận hàng" && (
                    <>
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="btn btn-success"
                      >
                        Nhận đơn
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="btn btn-danger"
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="btn btn-primary"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
