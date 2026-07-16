const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Import Routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const mpesaRoutes = require('./routes/mpesaRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Import the file we just made
const bannerRoutes = require('./routes/bannerRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- 1. Mount API Routes ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/upload', uploadRoutes); // The upload endpoint
app.use('/api/banner', bannerRoutes);


// --- 2. Make Uploads Folder Static ---
// This allows the browser to open http://localhost:5000/uploads/image.jpg
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, '/uploads')));

// Deployment logic
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(dirname, '/frontend/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}
app.get('/api/config/paypal', (req, res) => 
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});