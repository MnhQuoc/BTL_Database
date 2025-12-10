import React, { useState, useEffect } from "react";
import NavbarWeb from "../Navigate/NavbarWeb";
import Footer from "../Footer/Footer";
import BackToTop from "../backtotop/BackToTop";
import { Outlet } from "react-router-dom";

const LayoutWithNavbar = () => {
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        const role = parsedUser?.role || "";
        // Ẩn footer cho admin và staff
        if (role === "admin" || role === "staff") {
          setShowFooter(false);
        } else {
          setShowFooter(true);
        }
      } catch (error) {
        console.error("Error parsing user:", error);
        setShowFooter(true);
      }
    } else {
      // Hiển thị footer cho guest
      setShowFooter(true);
    }
  }, []);

  return (
    <div className="App">
      <NavbarWeb />
      <Outlet />
      <BackToTop />
      {showFooter && <Footer />}
    </div>
  );
};

export default LayoutWithNavbar;
