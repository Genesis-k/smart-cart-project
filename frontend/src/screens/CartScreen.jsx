import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../slices/cartSlice';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Get the cart data from Redux
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  // Handler to change quantity (e.g., from 1 to 2)
  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  // Handler to remove item
  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  // Handler for checkout button
  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <div className="row">
      {/* LEFT COLUMN: Cart Items */}
      <div className="col" style={{ flex: '2' }}>
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div style={{ padding: '20px', background: '#e9ecef' }}>
            Your cart is empty <Link to="/">Go Back</Link>
          </div>
        ) : (
          <div>
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-image" />
                
                <div className="item-details">
                  <Link to={`/product/${item._id}`} style={{ fontWeight: 'bold' }}>
                    {item.name}
                  </Link>
                  <p>KSh {item.price}</p>
                </div>

                <div className="item-actions">
                  {/* Quantity Selector */}
                  <select
                    value={item.qty}
                    onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                    style={{ padding: '5px' }}
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>

                  {/* Delete Button */}
                  <button
                    className="btn-danger"
                    type="button"
                    onClick={() => removeFromCartHandler(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Subtotal */}
      <div className="col" style={{ flex: '1' }}>
        <div className="subtotal-card">
          <h2>
            Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
          </h2>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            KSh {cartItems
              .reduce((acc, item) => acc + item.qty * item.price, 0)
              .toFixed(2)}
          </p>
          <hr />
          <button
            type="button"
            className="btn-black"
            disabled={cartItems.length === 0}
            onClick={checkoutHandler}
            style={{ 
                width: '100%', 
                padding: '15px', 
                background: '#000', 
                color: '#fff', 
                border: 'none', 
                cursor: 'pointer' 
            }}
          >
            Proceed To Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;