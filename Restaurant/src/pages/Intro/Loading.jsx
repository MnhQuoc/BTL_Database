import React, { useEffect, useState } from "react";

const LoadingCat = ({ onFinish }) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
      if (onFinish) onFinish();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (hidden) return null;

  return (
    <>
      <style>{`
        .loading-container {
          position: fixed;
          inset: 0;
          background-color: #111;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          animation: fadeOut 1s ease 2.5s forwards;
        }

        .flag-image {
          width: 320px;
          height: auto;
          margin-bottom: 10px;
        }

        .tank-image {
          width: 220px;
          animation: moveTank 3s ease forwards;
          margin-bottom: 30px;
        }

        .loading-text {
          color: #aaa;
          font-weight: bold;
          font-size: 1.4rem;
          text-align: center;
          line-height: 1.6;
        }

        @keyframes moveTank {
          0% {
            transform: translateX(-100px);
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>

      <div className="loading-container">
        <img
          src="/images/vietnam-flag.gif"
          alt="Vietnam Flag"
          className="flag-image"
        />
        <img src="/images/tank.webp" alt="Tank" className="tank-image" />
        <p className="loading-text">
          Cùng Trưa Nay Ăn Gì! Chào Mừng 50 Năm Thống Nhất<br />
          Đất Nước 30/04/1975 - 30/04/2025
        </p>
      </div>
    </>
  );
};

export default LoadingCat;