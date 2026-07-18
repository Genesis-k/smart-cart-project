import { Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// --- Global Components ---
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPopup from './components/LoginPopup';
import SearchBox from './components/SearchBox';
import DiscountBanner from './components/DiscountBanner';

// --- Public Screens ---
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ReturnPolicyScreen from './screens/ReturnPolicyScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsServiceScreen from './screens/TermsServiceScreen';

// --- User/Checkout Screens ---
import ProfileScreen from './screens/ProfileScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import WishlistScreen from './screens/WishlistScreen';

// --- Admin Screens ---
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import AnalysisScreen from './screens/admin/AnalysisScreen';
import ReviewListScreen from './screens/admin/ReviewListScreen';
import BannerEditScreen from './screens/admin/BannerEditScreen';
import AdminPendingOrdersBanner from './components/AdminPendingOrdersBanner';

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  // Define paths where the search bar should be HIDDEN
  const hideSearchPaths = ['/shipping', '/payment', '/placeorder', '/login', '/register'];
  const isOrderDetailsPage = location.pathname.startsWith('/order/');
  const isAdminRoute = location.pathname.startsWith('/admin'); // <-- NEW CHECK

  // Added !isAdminRoute so the search bar hides on all admin pages
  const shouldShowSearch = userInfo && !hideSearchPaths.includes(location.pathname) && !isOrderDetailsPage && !isAdminRoute;

  return (
    <>
      <DiscountBanner />
      <Header />
      <AdminPendingOrdersBanner />
      <LoginPopup />
      
      {/* SEARCH BAR SECTION */}
      {shouldShowSearch && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px 0', borderBottom: '1px solid #ddd' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
             <SearchBox />
          </div>
        </div>
      )}

      <main style={{ minHeight: '80vh', padding: '20px 0' }}>
        <div className="container">
          <Routes>
            {/* ---------------- PUBLIC ROUTES ---------------- */}
            <Route path='/' element={<HomeScreen />} />
            <Route path='/section/:sectionName' element={<HomeScreen />} />
            <Route path='/search/:keyword' element={<HomeScreen />} />
            <Route path='/page/:pageNumber' element={<HomeScreen />} />
            <Route path='/search/:keyword/page/:pageNumber' element={<HomeScreen />} />
            <Route path='/product/:id' element={<ProductScreen />} />
            <Route path='/cart' element={<CartScreen />} />
            <Route path='/login' element={<LoginScreen />} />
            <Route path='/register' element={<RegisterScreen />} />

            {/* Policies */}
            <Route path='/policy/returns' element={<ReturnPolicyScreen />} />
            <Route path='/policy/privacy' element={<PrivacyPolicyScreen />} />
            <Route path='/policy/terms' element={<TermsServiceScreen />} />

            {/* ---------------- USER ROUTES ---------------- */}
            <Route path='/profile' element={<ProfileScreen />} />
            <Route path='/wishlist' element={<WishlistScreen />} />
            <Route path='/shipping' element={<ShippingScreen />} />
            <Route path='/payment' element={<PaymentScreen />} />
            <Route path='/placeorder' element={<PlaceOrderScreen />} />
            <Route path='/order/:id' element={<OrderScreen />} />

            {/* ---------------- ADMIN ROUTES ---------------- */}
            <Route path='/admin/orderlist' element={<OrderListScreen />} />
            <Route path='/admin/productlist' element={<ProductListScreen />} />
            <Route path='/admin/productlist/:pageNumber' element={<ProductListScreen />} />
            <Route path='/admin/product/:id/edit' element={<ProductEditScreen />} />
            <Route path='/admin/analysis' element={<AnalysisScreen />} />
            <Route path='/admin/reviews' element={<ReviewListScreen />} />
            <Route path='/admin/banner' element={<BannerEditScreen />} />

            {/* ---------------- FALLBACK ROUTE ---------------- */}
            {/* Catches any broken links and prevents the ugly React Router crash screen */}
            <Route path='*' element={
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>404 - Page Not Found</h2>
                <p>We couldn't find the page you were looking for.</p>
              </div>
            } />
          </Routes>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default App;