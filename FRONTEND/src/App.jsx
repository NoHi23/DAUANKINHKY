import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import HomePage from './components/HomePage/HomePage';
import ProductListPage from './components/Products/ProductListPage';
import ProductDetailPage from './components/Products/ProductDetailPage';
import FigureListPage from './components/Figures/FigureListPage';
import FigureDetailPage from './components/Figures/FigureDetailPage';
import BlogPage from './components/Blog/BlogPage';
import PostDetailPage from './components/Blog/PostDetailPage';

import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';

import PaymentSuccessPage from './components/Checkout/PaymentSuccessPage';
import PaymentFailPage from './components/Checkout/PaymentFailPage';

import ProfilePage from './components/Profile/ProfilePage';
import OrderHistoryPage from './components/Order/OrderHistoryPage';
import CartPage from './components/Cart/CartPage';
import CheckoutPage from './components/Checkout/CheckoutPage';

import AdminLayout from './components/Admin/AdminLayout';
import AdminOrderList from './components/Admin/AdminOrderList';
import AdminProductList from './components/Admin/AdminProductList';
import AdminProductForm from './components/Admin/AdminProductForm';
import AdminUserList from './components/Admin/AdminUserList';
import AdminCouponList from './components/Admin/AdminCouponList';
import AdminCouponForm from './components/Admin/AdminCouponForm';
import AdminFigureList from './components/Admin/AdminFigureList';
import AdminFigureForm from './components/Admin/AdminFigureForm';

import ProtectedRoute from './components/Routing/ProtectedRoute';
import PaymentResultPage from './components/Checkout/PaymentResultPage';
import BackToTopButton from './components/Common/BackToTopButton'; // <<-- 1. IMPORT
import ScrollToTop from './components/Common/ScrollToTop';
import ContactPage from './components/Contact/ContactPage';
function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  return (
    <div className="app-wrapper">
      <AuthProvider>
        <CartProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Navbar />
          <div className={`main-content ${isAdminPage ? 'full-width' : ''}`}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/products' element={<ProductListPage />} />
              <Route path='/products/:id' element={<ProductDetailPage />} />
              <Route path='/figures' element={<FigureListPage />} />
              <Route path='/figures/:id' element={<FigureDetailPage />} />
              <Route path='/blog' element={<BlogPage />} />
              <Route path='/contact' element={<ContactPage/>}/>
              <Route path='/posts/:id' element={<PostDetailPage />} />

              <Route path='/login' element={<LoginPage />} />
              <Route path='/register' element={<RegisterPage />} />
              <Route path='/payment-result' element={<PaymentResultPage />} />


              <Route element={<ProtectedRoute />}>
                <Route path='/profile' element={<ProfilePage />} />
                <Route path='/order-history' element={<OrderHistoryPage />} />
                <Route path='/cart' element={<CartPage />} />
                <Route path='/checkout' element={<CheckoutPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin', 'moderator']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="orders" element={<AdminOrderList />} />
                  <Route path="products" element={<AdminProductList />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/edit/:id" element={<AdminProductForm />} />
                  <Route path="figures" element={<AdminFigureList />} />
                  <Route path="figures/new" element={<AdminFigureForm />} />
                  <Route path="figures/edit/:id" element={<AdminFigureForm />} />

                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="users" element={<AdminUserList />} />
                    <Route path="coupons" element={<AdminCouponList />} />
                    <Route path="coupons/new" element={<AdminCouponForm />} />
                  </Route>
                </Route>
              </Route>

            </Routes>
          </div>
          <Footer />
          <BackToTopButton />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;