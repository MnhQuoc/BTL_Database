import React, { useEffect, useState } from "react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  // Hiện nút khi scroll xuống dưới 300px
  const toggleVisibility = () => {
    setVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    visible && (
      <button
        onClick={scrollToTop}
        style={{
          position: "fixed",
          bottom: "40px",
          right: "30px",
          padding: "10px 14px",
          fontSize: "18px",
          backgroundColor: "#c58d4e",
          color: "white",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        }}
        title="Lên đầu trang"
      >
        ↑
      </button>
    )
  );
};

export default BackToTop;
