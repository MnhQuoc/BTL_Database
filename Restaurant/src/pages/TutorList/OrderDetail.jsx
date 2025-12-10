import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Table, Card } from "react-bootstrap";
import axios from "axios";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [foods, setFoods] = useState([]);
  const API_URL = "http://localhost:3001";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await axios.get(`${API_URL}/orders/${orderId}`);
        setOrder(orderRes.data);

        const userRes = await axios.get(`${API_URL}/users/${orderRes.data.userId}`);
        setCustomer(userRes.data);

        const foodRes = await axios.get(`${API_URL}/courses`);
        setFoods(foodRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu đơn hàng:", error);
      }
    };

    fetchData();
  }, [orderId]);

  const formatCurrency = (amount) => amount.toLocaleString("vi-VN") + "đ";

  const findFoodById = (foodId) =>
    foods.find((f) => f.id.toString() === foodId.toString());

  if (!order || !customer) return <p>Đang tải dữ liệu...</p>;

  const deliveryFee = 15000;
  const serviceFee = 5000;
  const discount = 10000;
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee + serviceFee - discount;

  return (
    <Container className="my-5">
      <Card border="warning">
        <Card.Header className="bg-brand fw-bold">
          Chi tiết đơn hàng
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <p>
                <strong className="text-brand">Mã đơn hàng:</strong> {order.id}
              </p>
              <p>
                <strong>Ngày đặt hàng:</strong>{" "}
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>Thời gian giao dự kiến:</strong>{" "}
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>Trạng thái:</strong> {order.status}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Tên khách:</strong> {customer.username}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {customer.phone}
              </p>
              <p>
                <strong>Địa chỉ nhận hàng:</strong>{" "}
                {order.deliveryAddress || "Chưa cập nhật"}
              </p>
            </Col>
          </Row>

          <h5 className="mb-3 fw-bold text-brand">Danh sách món đã đặt</h5>
          <Table striped bordered hover>
            <thead className="bg-light">
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => {
                const food = findFoodById(item.foodId);
                if (!food) return null;
                return (
                  <tr key={idx}>
                    <td>{food.name}</td>
                    <td>{item.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Row className="mt-4 justify-content-end">
            <Col md={6}>
              <Table borderless>
                <tbody>
                  <tr>
                    <td>
                      <strong>Tổng tiền hàng:</strong>
                    </td>
                    <td className="text-end">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Phí giao hàng:</strong>
                    </td>
                    <td className="text-end">{formatCurrency(deliveryFee)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Phí dịch vụ:</strong>
                    </td>
                    <td className="text-end">{formatCurrency(serviceFee)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Giảm giá:</strong>
                    </td>
                    <td className="text-end text-danger">
                      -{formatCurrency(discount)}
                    </td>
                  </tr>
                  <tr className="border-top fw-bold fs-5">
                    <td>
                      <span className="text-brand">Tổng thanh toán:</span>
                    </td>
                    <td className="text-end text-brand">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderDetail;
