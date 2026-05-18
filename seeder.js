const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

/**
 * Imports sample data into the database.
 * 1. Clears existing data.
 * 2. Inserts new users.
 * 3. Gets the admin user's ID.
 * 4. Maps products to include the admin user's ID.
 * 5. Inserts new products.
 */
const importData = async () => {
  try {
    // 1. Clear the database
    await Product.deleteMany();
    await User.deleteMany();

    // 2. Insert users
    const createdUsers = await User.insertMany(users);

    // 3. Get the admin user's ID (we set the admin as the first user in users.js)
    const adminUser = createdUsers[0]._id;

    // 4. Add the admin's ID to each product
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser }; // Link each product to the admin user
    });

    // 5. Insert all sample products
    await Product.insertMany(sampleProducts);

    console.log('-------------------------');
    console.log('Data Imported! 🌱');
    console.log('-------------------------');
    process.exit(); // Stop the script
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Stop with an error
  }
};

/**
 * Destroys all data in the database.
 */
const destroyData = async () => {
  try {
    // Clear the database
    await Product.deleteMany();
    await User.deleteMany();

    console.log('-------------------------');
    console.log('Data Destroyed! 💥');
    console.log('-------------------------');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Check for command-line arguments
// 'node seeder.js -d' will run destroyData()
// 'node seeder.js' will run importData()
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}