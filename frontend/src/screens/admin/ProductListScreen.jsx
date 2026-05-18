import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Paginate from '../../components/Paginate';

const ProductListScreen = () => {
  const { pageNumber = 1 } = useParams();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`/api/products?pageNumber=${pageNumber}`);
      // Fixed: Extract array from the object returned by the Canvas logic
      setProducts(data.products);
      setPage(data.page);
      setPages(data.pages);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      fetchProducts();
    } else {
      navigate('/login');
    }
  }, [userInfo, navigate, pageNumber]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoadingDelete(true);
        await axios.delete(`/api/products/${id}`);
        setLoadingDelete(false);
        fetchProducts(); 
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting product');
        setLoadingDelete(false);
      }
    }
  };

  const createProductHandler = async () => {
    try {
      setLoadingCreate(true);
      const { data: createdProduct } = await axios.post('/api/products', {}); 
      setLoadingCreate(false);
      navigate(`/admin/product/${createdProduct._id}/edit`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating product');
      setLoadingCreate(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Products</h1>
        <button 
            className="btn-black" 
            onClick={createProductHandler}
            style={{ padding: '10px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loadingCreate ? 'Creating...' : '+ Create Product'}
        </button>
      </div>

      {loadingDelete && <h5>Deleting...</h5>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>NAME</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>PRICE</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>SECTION</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>CATEGORY</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product._id.substring(0, 10)}...</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>KSh {product.price}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.section}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.category}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <Link to={`/admin/product/${product._id}/edit`}>
                  <button style={{ marginRight: '10px', cursor: 'pointer', padding: '5px 10px' }}>Edit</button>
                </Link>
                <button 
                    style={{ color: 'red', cursor: 'pointer', padding: '5px 10px' }}
                    onClick={() => deleteHandler(product._id)}
                >
                    Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Paginate pages={pages} page={page} isAdmin={true} />
    </div>
  );
};

export default ProductListScreen;