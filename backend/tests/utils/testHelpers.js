const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Brand = require('../../models/Brand');
const Category = require('../../models/Category');

// Create test user
const createTestUser = async (isAdmin = false) => {
  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    isVerified: true,
    isAdmin: isAdmin
  });
  return await user.save();
};

// Create test admin
const createTestAdmin = async () => {
  return await createTestUser(true);
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({
    _id: user._id,
    email: user.email,
    isVerified: user.isVerified,
    isAdmin: user.isAdmin
  }, process.env.SECRET_KEY || 'testsecret');
};

// Create test brand
const createTestBrand = async () => {
  const brand = new Brand({ name: 'Test Brand' });
  return await brand.save();
};

// Create test category
const createTestCategory = async () => {
  const category = new Category({ name: 'Test Category' });
  return await category.save();
};

// Create test product
const createTestProduct = async (overrides = {}) => {
  const brand = await createTestBrand();
  const category = await createTestCategory();
  
  const product = new Product({
    title: 'Test Product',
    description: 'Test Description',
    price: 100,
    discountPercentage: 0,
    stockQuantity: 10,
    brand: brand._id,
    category: category._id,
    thumbnail: 'test.jpg',
    images: ['test1.jpg', 'test2.jpg'],
    isDeleted: false,
    ...overrides
  });
  
  return await product.save();
};

module.exports = {
  createTestUser,
  createTestAdmin,
  generateToken,
  createTestBrand,
  createTestCategory,
  createTestProduct
};