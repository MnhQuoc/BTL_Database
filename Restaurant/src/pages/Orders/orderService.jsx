// src/orderService.js
import axios from "axios";

const API_URL = "http://localhost:3001/orders";

// Lấy tất cả đơn hàng
export const getAllOrders = () => axios.get(API_URL);

// Lấy chi tiết đơn hàng theo ID
export const getOrderById = (id) => axios.get(`${API_URL}/${id}`);

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = (id, status) =>
  axios.patch(`${API_URL}/${id}`, { status });