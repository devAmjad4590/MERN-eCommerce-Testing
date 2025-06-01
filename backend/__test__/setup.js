require('dotenv').config();
const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';

// Use test database
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/mern_ecommerce_test';

beforeAll(async () => {
  console.log('Starting API tests...');
  
  // Set test timeout
  jest.setTimeout(30000);
  
  // Ensure clean database state
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

afterAll(async () => {
  console.log('API tests completed');
  
  // Clean up database connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Force exit if needed
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for all tests
jest.setTimeout(15000);