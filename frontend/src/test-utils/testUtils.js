// frontend/src/__tests__/utils/testUtils.js
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

/**
 * WHAT THIS FILE DOES:
 * This file contains helper functions that make testing easier
 * Think of it like a toolbox - we keep all our testing tools here
 * 
 * Instead of writing the same setup code in every test file,
 * we write it once here and reuse it everywhere
 */

// Simple mock theme for Material-UI
const mockTheme = {
  palette: {
    primary: {
      main: '#000000',
      light: '#ffffff',
      dark: '#DB4444'
    }
  },
  breakpoints: {
    down: jest.fn(() => false) // Mock responsive breakpoints
  }
};

// Create a mock Redux store for testing
export const createTestStore = (initialState = {}) => {
  // These are simplified versions of your real Redux slices
  const mockReducers = {
    AuthSlice: (state = {
      status: "idle",
      errors: null,
      loggedInUser: null,
      isAuthChecked: true,
      signupStatus: "idle",
      loginStatus: "idle"
    }, action) => ({ ...state, ...initialState.AuthSlice }),
    
    ProductSlice: (state = {
      status: "idle",
      products: [],
      totalResults: 0,
      selectedProduct: null,
      isFilterOpen: false,
      productAddStatus: "idle",
      productUpdateStatus: "idle",
      productFetchStatus: "idle"
    }, action) => ({ ...state, ...initialState.ProductSlice }),
    
    CartSlice: (state = {
      status: "idle",
      items: [],
      cartItemAddStatus: "idle",
      cartItemRemoveStatus: "idle"
    }, action) => ({ ...state, ...initialState.CartSlice }),
    
    UserSlice: (state = {
      status: "idle",
      userInfo: null
    }, action) => ({ ...state, ...initialState.UserSlice }),
    
    BrandSlice: (state = {
      status: "idle",
      brands: []
    }, action) => ({ ...state, ...initialState.BrandSlice }),
    
    CategoriesSlice: (state = {
      status: "idle",
      categories: []
    }, action) => ({ ...state, ...initialState.CategoriesSlice })
  };

  return configureStore({
    reducer: mockReducers,
    preloadedState: initialState
  });
};

// Custom render function that includes all the providers your components need
export const renderWithProviders = (
  ui,
  {
    initialState = {},
    store = createTestStore(initialState),
    ...renderOptions
  } = {}
) => {
  // This wrapper provides all the context your components expect
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
};

// Mock data for testing - these represent typical data structures
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  isVerified: true,
  isAdmin: false
};

export const mockAdmin = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Test Admin',
  email: 'admin@example.com',
  isVerified: true,
  isAdmin: true
};

export const mockProduct = {
  _id: '507f1f77bcf86cd799439013',
  title: 'Test iPhone',
  description: 'A test iPhone for testing purposes',
  price: 999,
  discountPercentage: 10,
  stockQuantity: 50,
  brand: { 
    _id: '507f1f77bcf86cd799439014', 
    name: 'Apple' 
  },
  category: { 
    _id: '507f1f77bcf86cd799439015', 
    name: 'Electronics' 
  },
  thumbnail: 'https://example.com/iphone.jpg',
  images: [
    'https://example.com/iphone1.jpg',
    'https://example.com/iphone2.jpg'
  ],
  isDeleted: false
};

export const mockProducts = [
  mockProduct,
  {
    _id: '507f1f77bcf86cd799439016',
    title: 'Test Samsung',
    description: 'A test Samsung for testing purposes',
    price: 899,
    stockQuantity: 30,
    brand: { _id: '507f1f77bcf86cd799439017', name: 'Samsung' },
    category: { _id: '507f1f77bcf86cd799439015', name: 'Electronics' },
    isDeleted: false
  }
];

export const mockCartItem = {
  _id: '507f1f77bcf86cd799439020',
  user: mockUser._id,
  product: mockProduct,
  quantity: 2
};

// Helper functions for creating specific test states
export const createLoggedInState = (user = mockUser) => ({
  AuthSlice: {
    status: "idle",
    loggedInUser: user,
    isAuthChecked: true
  }
});

export const createProductsState = (products = mockProducts) => ({
  ProductSlice: {
    status: "fulfilled",
    products: products,
    totalResults: products.length,
    productFetchStatus: "fulfilled"
  }
});

export const createCartState = (items = [mockCartItem]) => ({
  CartSlice: {
    status: "fulfilled",
    items: items
  }
});

// Helper for creating admin state
export const createAdminState = () => ({
  AuthSlice: {
    status: "idle",
    loggedInUser: mockAdmin,
    isAuthChecked: true
  }
});

// Mock functions for API calls (these replace real API calls in tests)
export const mockApiCalls = {
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  searchProducts: jest.fn(),
  addToCart: jest.fn()
};

// Utility to wait for async operations in tests
export const waitForAsyncOperation = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Clean up function to reset mocks between tests
export const cleanup = () => {
  jest.clearAllMocks();
  Object.values(mockApiCalls).forEach(mockFn => mockFn.mockReset());
};

// Test data generators for different scenarios
export const generateTestProduct = (overrides = {}) => ({
  ...mockProduct,
  _id: `test-${Date.now()}`,
  ...overrides
});

export const generateInvalidProduct = (field) => {
  const product = { ...mockProduct };
  switch (field) {
    case 'title':
      product.title = null;
      break;
    case 'price':
      product.price = -100;
      break;
    case 'stock':
      product.stockQuantity = -5;
      break;
    default:
      break;
  }
  return product;
};

// Export everything as default for convenience
export default {
  renderWithProviders,
  createTestStore,
  mockUser,
  mockAdmin,
  mockProduct,
  mockProducts,
  mockCartItem,
  createLoggedInState,
  createProductsState,
  createCartState,
  createAdminState,
  mockApiCalls,
  cleanup,
  generateTestProduct,
  generateInvalidProduct
};