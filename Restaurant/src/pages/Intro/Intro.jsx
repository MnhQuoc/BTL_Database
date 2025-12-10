import React, { useState } from "react";
import { Typography, Button, Row, Col, Space } from "antd";
import { useNavigate } from "react-router";
// import LoadingCat from "./Loading";

const { Title, Paragraph } = Typography;

const styles = {
  wrapper: {
    backgroundImage: "url('/images/background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#98c8ebff",
    height: "100vh",
    textAlign: "center",
    padding: "0 20px",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1,
  },
  content: {
    position: "relative",
    zIndex: 2,
  },
  description: {
    color: "#000808ff",
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
  },
  extraInfo: {
    color: "#030505ff",
    fontSize: "1.2rem",
    maxWidth: "800px",
    margin: "0 auto 2rem",
    lineHeight: 1.6,
    textIndent: "0.8rem",
  },
  button: {
    backgroundColor: "#8ce5edff",
    color: "#000000",
    border: "none",
    fontWeight: "bold",
  },
};

const Intro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleExploreClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/home");
    });
  };

  return (
    <div style={styles.wrapper}>
      {/* CSS LED màu vàng */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');

        .led-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 5 rem;
          color: #fff8dc;
          text-shadow:
            0 0 5px #fff8dc,
            0 0 10px #4d20f1ff,
            0 0 20px #4d20f1ff,
            0 0 40px #4d20f1ff,
            0 0 80px #4d20f1ff;
          animation: flicker 1.5s infinite alternate;
        }

        @keyframes flicker {
          0%   { opacity: 1; }
          50%  { opacity: 0.85; text-shadow: 0 0 10px #8ce5edff, 
                                             0 0 20px #8ce5edff, 
                                             0 0 30px #8ce5edff; }
          100% { opacity: 1; }
        }
      `}</style>

      <div style={styles.overlay}></div>
      <Row justify="center" align="middle" style={{ height: "100vh" }}>
        <Col>
          <div style={styles.content}>
            <Space direction="vertical" size="large">
              <img
                src="/images/logoBK.png"
                alt="Intro Logo"
                style={{ width: "200px"}}
              />

              {/* Tiêu đề LED màu vàng */}
              <Title level={1} className="led-title">
                Assignment Database _ Group 8
              </Title>

              <Paragraph style={styles.extraInfo}>
                Giữa muôn vàn lựa chọn nhà hàng và món ăn, việc quản lý đơn hàng và thực đơn một cách hiệu quả là thách thức lớn đối với các nhà hàng hiện đại.
                Bọn mình tin rằng công nghệ có thể đơn giản hóa quá trình này.
                <br />
              <span style={{ marginLeft: "0.8rem" }}>Dự án <strong>Restaurant Management System</strong></span> được sinh ra để giải quyết bài toán đó - một hệ thống quản lý nhà hàng hiện đại, nơi khách hàng dễ dàng đặt món và nhà hàng quản lý hiệu quả.   {'\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
              </Paragraph>


              <Paragraph style={styles.description}>
                Cùng nhau khám phá <strong>Restaurant Management System</strong> của tụi mình nhé
              </Paragraph>

              <Button
                type="primary"
                size="large"
                style={styles.button}
                onClick={handleExploreClick}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3d84caff")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#8ce5edff")
                }
              >
                Khám phá ngay
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
      {/* {loading && <LoadingCat />} */}
    </div>
  );
};

export default Intro;
