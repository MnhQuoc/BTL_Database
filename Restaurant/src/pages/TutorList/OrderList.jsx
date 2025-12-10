import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button, Table } from "react-bootstrap";
import { FaEye } from "react-icons/fa";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const API_URL = "http://localhost:3001/orders";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_URL);
      const user = JSON.parse(localStorage.getItem("user"));

      if (user && user.role === "tutor") {
        const tutorOrders = response.data.filter(
          (order) => order.tutorId === user.id
        );
        setOrders(tutorOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
    }
  };

  const confirmStatusChange = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/${id}`, { status });
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Chờ nhận hàng":
        return "secondary";
      case "Đã nhận món":
        return "warning";
      case "Đang chế biến":
        return "info";
      case "Đang giao":
        return "primary";
      case "Đã hoàn thành":
        return "success";
      case "Hủy":
        return "danger";
      default:
        return "light";
    }
  };

  return (
    <div className="container p-4">
      <h1
        className="text-center mb-4 p-2"
        style={{
          backgroundColor: "#c58d4e",
          color: "white",
          borderRadius: "8px",
        }}
      >
        Danh sách yêu cầu / đơn của Tutor
      </h1>
      <Table bordered striped>
        <thead style={{ backgroundColor: "#f5e6d0" }}>
          <tr>
            <th>Mã đơn</th>
            <th>Thời gian đặt</th>
            <th>Người đặt</th>
            <th>Tổng món</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                <td>{order.username || order.userId}</td>
                <td>{order.items.length}</td>
                <td>{order.totalAmount.toLocaleString("vi-VN")} VND</td>
                <td className="text-center">
                  <span className={`badge bg-${getStatusVariant(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="hstack gap-1">
                    {order.status === "Chờ nhận hàng" && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            confirmStatusChange(order.id, "Đã nhận món")
                          }
                        >
                          Nhận đơn
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            confirmStatusChange(order.id, "Hủy")
                          }
                        >
                          Hủy đơn
                        </Button>
                      </>
                    )}

                    {order.status === "Đã nhận món" && (
                      <span className="text-muted small">
                        Đơn đã được nhận
                      </span>
                    )}

                    {order.status === "Hủy" && (
                      <span className="text-muted small">
                        Đơn đã bị hủy
                      </span>
                    )}

                    <Link
                      to={`/orderdetail/${order.id}`}
                      className="btn btn-info btn-sm text-center"
                    >
                      <FaEye />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                Không có đơn hàng nào.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default OrderList;
