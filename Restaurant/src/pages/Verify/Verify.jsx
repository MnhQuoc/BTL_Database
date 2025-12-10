import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Spinner, Alert, Button } from "react-bootstrap";

const Verify = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (!userId) {
        setStatus({ type: "danger", message: "Liên kết không hợp lệ." });
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying user ID:', userId);
        
        // Fetch tất cả users để tìm user cần xác minh
        const usersRes = await fetch(`http://localhost:3001/users`);
        if (!usersRes.ok) {
          throw new Error("Không thể kết nối đến server.");
        }
        
        const users = await usersRes.json();
        const user = users.find(u => String(u.id) === String(userId));
        
        console.log('Found user:', user);
        
        if (!user) {
          setStatus({ type: "danger", message: "Không tìm thấy người dùng. Vui lòng kiểm tra lại liên kết." });
          return;
        }
        
        if (user.verified) {
          setStatus({ type: "success", message: "Tài khoản đã xác minh trước đó." });
        } else {
          console.log('Updating user to verified...');
          
          // Update user với verified = true
          const updateRes = await fetch(`http://localhost:3001/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verified: true }),
          });
          
          console.log('Update response:', updateRes.status, updateRes.statusText);
          
          if (updateRes.ok) {
            setStatus({ type: "success", message: "Xác minh tài khoản thành công!" });
          } else {
            const errorText = await updateRes.text();
            console.error('Update error:', errorText);
            throw new Error("Không thể cập nhật trạng thái xác minh.");
          }
        }
      } catch (error) {
        console.error("Lỗi xác minh:", error);
        console.error("Error details:", error.message, error.stack);
        setStatus({ type: "danger", message: "Đã xảy ra lỗi khi xác minh tài khoản." });
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [userId]);

  return (
    <Container className="mt-5 text-center">
      {loading ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang xác minh...</span>
        </Spinner>
      ) : (
        <>
          <Alert variant={status.type}>{status.message}</Alert>
          <Button onClick={() => navigate("/login")} variant="primary">
            Về trang đăng nhập
          </Button>
        </>
      )}
    </Container>
  );
};

export default Verify;
