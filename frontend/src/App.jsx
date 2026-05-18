import { Routes, Route, useLocation } from 'react-router-dom'; // Added useLocation
import { useSelector } from 'react-redux';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderListScreen from './screens/admin/OrderListScreen';
import ProductListScreen from './screens/admin/ProductListScreen';
import ProductEditScreen from './screens/admin/ProductEditScreen';
import AnalysisScreen from './screens/admin/AnalysisScreen';
import ReviewListScreen from './screens/admin/ReviewListScreen';
import BannerEditScreen from './screens/admin/BannerEditScreen';
import LoginPopup from './components/LoginPopup';
import ProfileScreen from './screens/ProfileScreen';
import WishlistScreen from './screens/WishlistScreen';
import SearchBox from './components/SearchBox';
import ReturnPolicyScreen from './screens/ReturnPolicyScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsServiceScreen from './screens/TermsServiceScreen';
import DiscountBanner from './components/DiscountBanner';

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  // Define paths where the search bar should be HIDDEN
  const hideSearchPaths = ['/shipping', '/payment', '/placeorder', '/login', '/register'];
  // Also hide on dynamic order details pages (e.g., /order/123)
  const isOrderDetailsPage = location.pathname.startsWith('/order/');
  const shouldShowSearch = userInfo && !hideSearchPaths.includes(location.pathname) && !isOrderDetailsPage;

  return (
    <>
      <DiscountBanner />
      
      <Header />
      <LoginPopup />
      
      {/* SEARCH BAR SECTION - Conditional Rendering */}
      {shouldShowSearch && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px 0', borderBottom: '1px solid #ddd' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
             <SearchBox />
          </div>
        </div>
      )}

      <main>
        <div className="container">
          <Routes>
            <Route path='/' element={<HomeScreen />} />
            <Route path='/section/:sectionName' element={<HomeScreen />} />
            <Route path='/search/:keyword' element={<HomeScreen />} />
            <Route path='/page/:pageNumber' element={<HomeScreen />} />
            <Route path='/search/:keyword/page/:pageNumber' element={<HomeScreen />} />

            <Route path='/product/:id' element={<ProductScreen />} />
            <Route path='/cart' element={<CartScreen />} />
            <Route path='/login' element={<LoginScreen />} />
            <Route path='/register' element={<RegisterScreen />} />
            <Route path='/shipping' element={<ShippingScreen />} />
            <Route path='/payment' element={<PaymentScreen />} />
            <Route path='/placeorder' element={<PlaceOrderScreen />} />
            <Route path='/order/:id' element={<OrderScreen />} />
            <Route path='/profile' element={<ProfileScreen />} />
            <Route path='/wishlist' element={<WishlistScreen />} />
            
            <Route path='/policy/returns' element={<ReturnPolicyScreen />} />
            <Route path='/policy/privacy' element={<PrivacyPolicyScreen />} />
            <Route path='/policy/terms' element={<TermsServiceScreen />} />
            
            <Route path='/admin/orderlist' element={<OrderListScreen />} />
            <Route path='/admin/productlist' element={<ProductListScreen />} />
            <Route path='/admin/productlist/:pageNumber' element={<ProductListScreen />} />
            <Route path='/admin/product/:id/edit' element={<ProductEditScreen />} />
            <Route path='/admin/analysis' element={<AnalysisScreen />} />
            <Route path='/admin/reviews' element={<ReviewListScreen />} />
            <Route path='/admin/banner' element={<BannerEditScreen />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default App;