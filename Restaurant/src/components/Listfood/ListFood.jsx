import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import các icon từ react-icons

const ListFood = () => {
  const [foods, setFoods] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await axios.get('http://localhost:3001/courses');
      setFoods(res.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa món ăn này?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3001/courses/${id}`);
      const updatedFoods = foods.filter(food => food.id !== id);
      setFoods(updatedFoods);
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Danh sách món ăn</h2>

      {/* Nút thêm món ăn ở trên, dưới tiêu đề */}
      <div className="d-flex justify-content-start mb-4">
        <button
          className="btn btn-success"
          onClick={() => navigate('/addfood')} // Điều hướng đến trang thêm món ăn
        >
          Thêm món ăn
        </button>
      </div>

      <div className="row">
        {foods.map((food) => (
          <div className="col-md-4 mb-4" key={food.id}>
            <div className="card h-100">
              <img
                src={food.image || 'https://via.placeholder.com/150'}
                className="card-img-top"
                alt={food.name}
              />
              <div className="card-body">
                <h5 className="card-title">{food.name}</h5>
                <p className="card-text">{food.note}</p>
                <p className="card-text">
                  <strong>Phí DV:</strong> {food.serviceFee}đ
                </p>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/editfood/${food.id}`)}
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(food.id)}
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {foods.length === 0 && (
          <div className="text-center mt-4 text-muted">Không tìm thấy món ăn nào.</div>
        )}
      </div>
    </div>
  );
};

export default ListFood;