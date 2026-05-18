import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ProductEditScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [section, setSection] = useState('Female');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}`);
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setBrand(data.brand);
        setCategory(data.category);
        setSection(data.section || 'Female');
        setCountInStock(data.countInStock);
        setDescription(data.description);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (userInfo && userInfo.isAdmin) {
        fetchProduct();
    } else {
        navigate('/login');
    }
  }, [productId, userInfo, navigate]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);
      const normalizedPath = data.replace(/\\/g, '/');
      setImage(normalizedPath);
      setUploading(false);
    } catch (error) {
      setUploading(false);
      alert(error.response?.data?.message || 'File upload failed.');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoadingUpdate(true);
      await axios.put(`/api/products/${productId}`, {
        name,
        price,
        image,
        brand,
        category,
        section,
        description,
        countInStock,
      });

      setLoadingUpdate(false);
      navigate('/admin/productlist');
    } catch (err) {
      setLoadingUpdate(false);
      alert(err.response?.data?.message || 'Error updating product');
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '50px' }}>
      <Link to="/admin/productlist" className="btn-light" style={{ textDecoration: 'none', color: '#555' }}>
        Go Back
      </Link>
      
      <h1>Edit Product</h1>
      
      <form onSubmit={submitHandler}>
        <div style={{ marginBottom: '15px' }}>
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Price (KSh)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: '100%', padding: '10px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Image</label>
          <input type="text" placeholder="Enter image url" value={image} onChange={(e) => setImage(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <input type="file" onChange={uploadFileHandler} accept="image/*" />
          {uploading && <p>Uploading...</p>}
        </div>

        {/* UPDATED SECTION SELECTOR */}
        <div style={{ marginBottom: '15px' }}>
          <label>Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          >
            <option value="Female">Women</option>
            <option value="Male">Men</option>
            <option value="Kids">Kids</option>
            <option value="Male-Footwear">Men's Footwear</option>
            <option value="Female-Footwear">Women's Footwear</option>
            <option value="Kids-Footwear">Kids' Footwear</option>
            <option value="Beauty">Beauty</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%', padding: '10px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Count In Stock</label>
          <input type="number" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} style={{ width: '100%', padding: '10px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', height: '100px' }}></textarea>
        </div>

        <button type="submit" className="btn-black" style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
          Update
        </button>
      </form>
    </div>
  );
};

export default ProductEditScreen;