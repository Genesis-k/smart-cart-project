import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Enables routing
import { Provider } from 'react-redux'; // Enables Redux
import store from './store'; // Import the store we created
import App from './App.jsx';
import './index.css'; // Global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Wrap the App in Provider so it can access the Cart data */}
    <Provider store={store}>
      {/* 2. Wrap the App in BrowserRouter so it can handle URLs */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);