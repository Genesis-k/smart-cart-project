import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import BackButton from '../components/BackButton';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  // Check if any item in the cart is now out of stock
  const hasOutOfStockItem = cartItems.some((item) => item.countInStock === 0);

  return (
    <>
      <BackButton />
      <h1 style={{ marginBottom: '30px' }}>Shopping Cart</h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* LEFT SIDE: Cart Items */}
        <div style={{ flex: '2 1 60%', minWidth: '300px' }}>
          {cartItems.length === 0 ? (
            <div style={{ padding: '20px', background: '#e9ecef', borderRadius: '5px' }}>
              Your cart is empty <Link to="/">Go Back</Link>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cartItems.map((item) => (
                <li
                  key={item._id}
                  style={{
                    borderBottom: '1px solid #ddd',
                    padding: '20px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px',
                    ...(item.countInStock === 0 ? { backgroundColor: '#fff5f5', borderRadius: '8px', padding: '20px 10px' } : {}),
                  }}
                >
                  {/* Thumbnail Image */}
                  <div style={{ width: '80px', flexShrink: 0 }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Product Name & Stock Warning */}
                  <div style={{ flex: '2', minWidth: '150px' }}>
                    <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {item.name}
                    </Link>
                    {item.countInStock === 0 && (
                      <p style={{ margin: '5px 0 0 0', color: '#e74c3c', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        ⚠️ This item is now out of stock
                      </p>
                    )}
                    {item.countInStock > 0 && item.countInStock <= 5 && (
                      <p style={{ margin: '5px 0 0 0', color: '#e67e22', fontSize: '0.85rem' }}>
                        Only {item.countInStock} left
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ fontWeight: 'bold', minWidth: '100px' }}>
                    KSh {item.price}
                  </div>

                  {/* Quantity Dropdown - only show if in stock */}
                  {item.countInStock > 0 ? (
                    <div>
                      <select
                        value={item.qty}
                        onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '5px',
                          border: '1px solid #ccc',
                          cursor: 'pointer',
                          minWidth: '60px',
                        }}
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div style={{ minWidth: '60px', textAlign: 'center', color: '#999' }}>—</div>
                  )}

                  {/* Delete Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => removeFromCartHandler(item._id)}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      title="Remove from cart"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT SIDE: Subtotal & Checkout Card */}
        <div style={{ flex: '1 1 30%', minWidth: '280px' }}>
          <div
            className="card"
            style={{
              padding: '30px',
              border: '1px solid #e4e5e9',
              borderRadius: '10px',
              backgroundColor: '#fafafa',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: '20px',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#555' }}>
              Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
            </h2>

            <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '25px', color: '#111' }}>
              KSh {cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
            </h3>

            {/* Out of stock warning */}
            {hasOutOfStockItem && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fff3cd',
                color: '#856404',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '0.9rem',
                border: '1px solid #ffeeba',
              }}>
                ⚠️ Some items in your cart are out of stock. Please remove them before checking out.
              </div>
            )}

            <button
              type="button"
              className="btn-black"
              disabled={cartItems.length === 0 || hasOutOfStockItem}
              onClick={checkoutHandler}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: (cartItems.length === 0 || hasOutOfStockItem) ? '#ccc' : 'black',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: (cartItems.length === 0 || hasOutOfStockItem) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Proceed To Checkout
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default CartScreen;