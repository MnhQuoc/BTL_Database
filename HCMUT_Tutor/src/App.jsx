import './App.css';
import React from 'react';
import { Route, Routes } from 'react-router';
import LayoutWithNavbar from "./components/LayoutWithNavbar/LayoutWithNavbar.jsx";

import Header from './pages/Home/Header.jsx';
import About from './pages/RecommendFood/About.jsx';
import Team from './pages/Team/Team.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Users from './pages/Users/Users.jsx';
import Intro from './pages/Intro/Intro.jsx';
import Register from './components/Register/Register.jsx';
import Login from './components/Login/Login.jsx';
import Signup from './components/Signup/Signup.jsx';
import TutorList from './pages/TutorList/TutorList.jsx';
import ChangeInfo from './pages/ChangeInfo/ChangeInfo.jsx';
import OrderList from './pages/TutorList/OrderList.jsx';
import OrderDetail from './pages/TutorList/OrderDetail.jsx';
import Verify from './pages/Verify/Verify.jsx';
import AddFoodItem from './components/Addfood/AddFoodItem.jsx';
import ListFood from './components/Listfood/ListFood.jsx';
import FoodEdit from './components/Editfood/EditFood.jsx';
import MainContent from './pages/Content/MainContent.jsx';
import Menu from './components/Navigate/Menu.jsx';
import FoodDetail from './pages/FoodDetail/FoodDetail.jsx'; 
import Checkout from './pages/Checkout/Checkout.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import Cart from './pages/Cart/Cart.jsx';
import MySessions from './pages/MySessions/MySessions.jsx';
import FindTutor from './pages/FindTutor/FindTutor.jsx';
import OpenCourse from './pages/OpenCourse/OpenCourse.jsx';
import Reports from './pages/Reports/Reports.jsx';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.log('Error:', error);
    console.log('Error Info:', errorInfo);
    // Store details so we can render them in development for debugging
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      // In production show a friendly message. In development show details to help debugging.
      if (process.env.NODE_ENV !== 'production') {
        return (
          <div style={{ padding: 20 }}>
            <h1>Đã xảy ra lỗi. Vui lòng thử lại sau.</h1>
            {this.state.error && (
              <div style={{ marginTop: 12 }}>
                <strong>Error:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8 }}>{String(this.state.error)}</pre>
              </div>
            )}
            {this.state.errorInfo && this.state.errorInfo.componentStack && (
              <div style={{ marginTop: 12 }}>
                <strong>Component stack:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8 }}>{this.state.errorInfo.componentStack}</pre>
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
            </div>
          </div>
        );
      }
      return <h1>Đã xảy ra lỗi. Vui lòng thử lại sau.</h1>;
    }
    return this.props.children;
  }
}

function App() {
  // declare a variable to store state logged in
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <ErrorBoundary>
      <CartProvider>
        <Routes>
          {/* Trang intro riêng, không có navbar/footer */}
          <Route path="/" element={<Intro />} />
          {/* Layout có Navbar/Footer */}
          <Route path="/" element={<LayoutWithNavbar />}>
            <Route path="home" element={
              <div className="home-banner-wrapper">
                <div className="home-content">
                  <Header />
                  <About />
                </div>
              </div>
            } />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<Users />} />
            <Route path="menu" element={<Menu />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="signup" element={<Signup />} />
            <Route path="listtutor" element={<TutorList />} />
            <Route path="changeinfo" element={<ChangeInfo />} />
            <Route path="orderlist" element={<OrderList />} />
            <Route path="orderdetail/:orderId" element={<OrderDetail />} />
            <Route path="verify/:userId" element={<Verify />} />
            <Route path="addfood" element={<AddFoodItem />} />
            <Route path="listfood" element={<ListFood />} />
            <Route path="editfood/:id" element={<FoodEdit />} />
            <Route path="main-content" element={<MainContent />} />
            <Route path="/courses/:id" element={<FoodDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="my-sessions" element={<MySessions />} />
            <Route path="find-tutor" element={<FindTutor />} />
            <Route path="open-course" element={<OpenCourse />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
