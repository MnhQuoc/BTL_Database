import React, { useEffect, useState } from 'react';
export default function TutorList() {
    const [requests, setRequests] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [requestsRes, tutorsRes] = await Promise.all([
                    fetch('http://localhost:3001/request?status=pending'),
                    fetch('http://localhost:3001/users?role=staff&verified=true'),
                ]);

                if (requestsRes.ok && tutorsRes.ok) {
                    const requestsData = await requestsRes.json();
                    const tutorsData = await tutorsRes.json();
                    setRequests(requestsData);
                    setTutors(tutorsData);
                } else {
                    setMessage('Không thể tải dữ liệu');
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error);
                setMessage('Có lỗi xảy ra');
            }
        };

        fetchData();
    }, []);

    const handleApprove = async (requestId, userId) => {
        try {
            await fetch(`http://localhost:3001/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'staff', verified: true }),
            });

            await fetch(`http://localhost:3001/request/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' }),
            });

            setRequests(prev => prev.filter(req => req.id !== requestId));
            setMessage('Đã duyệt thành công');

            // Reload staff list
            const updatedTutors = await fetch('http://localhost:3001/users?role=staff&verified=true');
            const tutorsData = await updatedTutors.json();
            setTutors(tutorsData);
        } catch (error) {
            console.error('Lỗi khi duyệt:', error);
            setMessage('Lỗi khi duyệt yêu cầu');
        }
    };
    const handleReject = async (requestId) => {
        try {
            await fetch(`http://localhost:3001/request/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' }),
            });

            setRequests(prev => prev.filter(req => req.id !== requestId));
            setMessage('Yêu cầu đã bị từ chối');
        } catch (error) {
            console.error('Lỗi khi từ chối:', error);
            setMessage('Lỗi khi từ chối yêu cầu');
        }
    };
    return (
        <>
            <div className="container mt-4">
                <h2>Yêu cầu duyệt người dùng</h2>
                {message && <div className="alert alert-info">{message}</div>}
                {requests.length === 0 ? (
                    <p>Không có yêu cầu nào đang chờ duyệt</p>
                ) : (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>ID Người dùng</th>
                            <th>Vai trò yêu cầu</th>
                            <th>Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td>{req.userId}</td>
                                <td>{req.role}</td>
                                <td>
                                    <button className="btn btn-primary flex-grow-1" onClick={() => handleApprove(req.id, req.userId)}>Duyệt</button>
                                    <button className="btn btn-success flex-grow-1" onClick={() => handleReject(req.id)}>Từ chối</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                <h2 className="mt-5">Danh sách Tutor đã được duyệt</h2>
                {tutors.length === 0 ? (
                    <p>Chưa có Tutor nào được duyệt</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên cửa hàng</th>
                            <th>Email</th>
                            <th>Địa chỉ</th>
                            <th>Giờ mở cửa</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tutors.map(tutor => (
                            <tr key={tutor.id}>
                                <td>{tutor.id}</td>
                                <td>{tutor.name || 'Chưa cập nhật'}</td>
                                <td>{tutor.email}</td>
                                <td>{tutor.address}</td>
                                <td>{tutor.availability || 'Không có lịch'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    )
}