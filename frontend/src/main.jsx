import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import store from './store';

// --- Layout & Styles ---
import App from './App.jsx';
import './index.css';

// --- Public Screens ---
import HomeScreen from './screens/HomeScreen.jsx';
import ProductScreen from './screens/ProductScreen.jsx';
import CartScreen from './screens/CartScreen.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import ReturnPolicyScreen from './screens/ReturnPolicyScreen.jsx';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen.jsx';
import TermsServiceScreen from './screens/TermsServiceScreen.jsx';

// --- User/Checkout Screens ---
import ProfileScreen from './screens/ProfileScreen.jsx';
import ShippingScreen from './screens/ShippingScreen.jsx';
import PaymentScreen from './screens/PaymentScreen.jsx';
import PlaceOrderScreen from './screens/PlaceOrderScreen.jsx';
import OrderScreen from './screens/OrderScreen.jsx';
import WishlistScreen from './screens/WishlistScreen.jsx';

// --- Admin Screens ---
import OrderListScreen from './screens/admin/OrderListScreen.jsx';
import ProductListScreen from './screens/admin/ProductListScreen.jsx';
import ProductEditScreen from './screens/admin/ProductEditScreen.jsx';
import AnalysisScreen from './screens/admin/AnalysisScreen.jsx';
import ReviewListScreen from './screens/admin/ReviewListScreen.jsx';
import BannerEditScreen from './screens/admin/BannerEditScreen.jsx';

// Configure App Routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      
      {/* ---------------- PUBLIC ROUTES ---------------- */}
      <Route index={true} path='/' element={<HomeScreen />} />
      <Route path='/page/:pageNumber' element={<HomeScreen />} />
      <Route path='/search/:keyword' element={<HomeScreen />} />
      <Route path='/search/:keyword/page/:pageNumber' element={<HomeScreen />} />
      
      {/* --- NEW CATEGORY / SECTION ROUTES --- */}
      <Route path='/section/:sectionName' element={<HomeScreen />} />
      <Route path='/section/:sectionName/page/:pageNumber' element={<HomeScreen />} />
      
      <Route path='/product/:id' element={<ProductScreen />} />
      <Route path='/cart' element={<CartScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      
      <Route path='/policy/returns' element={<ReturnPolicyScreen />} />
      <Route path='/policy/privacy' element={<PrivacyPolicyScreen />} />
      <Route path='/policy/terms' element={<TermsServiceScreen />} />

      {/* ---------------- USER ROUTES ---------------- */}
      <Route path='/profile' element={<ProfileScreen />} />
      <Route path='/shipping' element={<ShippingScreen />} />
      <Route path='/payment' element={<PaymentScreen />} />
      <Route path='/placeorder' element={<PlaceOrderScreen />} />
      <Route path='/order/:id' element={<OrderScreen />} />
      <Route path='/wishlist' element={<WishlistScreen />} />

      {/* ---------------- ADMIN ROUTES ---------------- */}
      <Route path='/admin/orderlist' element={<OrderListScreen />} />
      <Route path='/admin/productlist' element={<ProductListScreen />} />
      <Route path='/admin/productlist/:pageNumber' element={<ProductListScreen />} />
      <Route path='/admin/product/:id/edit' element={<ProductEditScreen />} />
      <Route path='/admin/analysis' element={<AnalysisScreen />} />
      <Route path='/admin/reviews' element={<ReviewListScreen />} />
      <Route path='/admin/banner' element={<BannerEditScreen />} />
      
    </Route>
  )
);

const initialPayPalOptions = {
  'client-id': 'test',
  currency: 'USD',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PayPalScriptProvider options={initialPayPalOptions} deferLoading={true}>
        <RouterProvider router={router} />
      </PayPalScriptProvider>
    </Provider>
  </React.StrictMode>
);