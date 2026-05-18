import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Added useDispatch import
import axios from 'axios';
import Product from '../components/Product';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel'; // Ensure this is imported
import QuickViewModal from '../components/QuickViewModal';
import { addToCart } from '../slices/cartSlice';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState(null);
  
  const [quickProduct, setQuickProduct] = useState(null);

  const { keyword, pageNumber, sectionName } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `/api/products?pageNumber=${pageNumber || 1}`;
        if (keyword) url += `&keyword=${keyword}`;
        if (sectionName) url += `&section=${sectionName}`;

        const { data } = await axios.get(url);
        
        if (data.products) {
            setProducts(data.products);
            setPage(data.page);
            setPages(data.pages);
        } else {
            setProducts(data);
        }
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };

    fetchProducts();
  }, [keyword, pageNumber, sectionName]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    setQuickProduct(null);
    alert('Item added to cart!');
  };

  return (
    <>
      {/* Show Carousel ONLY on the main Home page (no search, no section filter, no pagination) */}
      {!keyword && !sectionName && !pageNumber && <ProductCarousel />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>{sectionName ? `${sectionName}'s Collection` : keyword ? `Search: ${keyword}` : 'Latest Products'}</h1>
        {(keyword || sectionName) && (
          <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>Clear Filters</Link>
        )}
      </div>
      
      {error ? (
        <div style={{ padding: '20px', background: '#f8d7da', color: '#721c24', borderRadius: '5px' }}>
          <h3>Error Loading Products</h3>
          <p>{error}. Check if your backend server is running.</p>
        </div>
      ) : (
        <>
          <div className="row">
            {products.length === 0 && <p>No products found.</p>}
            {products.map((product) => (
              <div key={product._id} className="col">
                <Product product={product} openQuickView={setQuickProduct} />
              </div>
            ))}
          </div>
          
          <Paginate 
            pages={pages} 
            page={page} 
            keyword={keyword ? keyword : ''} 
            sectionName={sectionName ? sectionName : ''} 
          />
        </>
      )}

      {quickProduct && (
        <QuickViewModal 
          product={quickProduct} 
          onClose={() => setQuickProduct(null)} 
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default HomeScreen;