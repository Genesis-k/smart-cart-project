  const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    // Hashed password for '123456'
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    // Hashed password for '123456'
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    // Hashed password for '123456'
    password: bcrypt.hashSync('123456', 10),
  },
];

module.exports = users;