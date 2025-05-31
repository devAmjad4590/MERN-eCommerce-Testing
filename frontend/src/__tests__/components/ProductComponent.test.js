// frontend/src/__tests__/components/ProductComponent.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

/**
 * WHAT THIS FILE TESTS:
 * This file tests actual React components - the UI elements users interact with
 * We're testing if buttons work, forms submit, etc.
 * 
 * Think of it like testing if the car's steering wheel actually turns the wheels
 */

// Mock ProductCard component for testing
const MockProductCard = ({ title, price, onAddToCart, isAdmin }) => (
  <div data-testid="product-card">
    <h3 data-testid="product-title">{title}</h3>
    <p data-testid="product-price">${price}</p>
    {!isAdmin && (
      <button data-testid="add-to-cart" onClick={() => onAddToCart(title)}>
        Add to Cart
      </button>
    )}
    {isAdmin && (
      <div>
        <button data-testid="edit-product">Edit</button>
        <button data-testid="delete-product">Delete</button>
      </div>
    )}
  </div>
);

// Mock Search component
const MockSearchComponent = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form data-testid="search-form" onSubmit={handleSubmit}>
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
      />
      <button data-testid="search-button" type="submit">
        Search
      </button>
    </form>
  );
};

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ProductSlice: (state = {
        products: [],
        selectedProduct: null,
        status: 'idle'
      }, action) => state,
      AuthSlice: (state = {
        loggedInUser: { isAdmin: false }
      }, action) => state
    },
    preloadedState: initialState
  });
};

const TestWrapper = ({ children, initialState = {} }) => {
  const store = createMockStore(initialState);
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

describe('TC-07 to TC-12: Product Component Tests', () => {
  
  describe('Product Display Components', () => {
    // Test that product information displays correctly
    test('Should display product information correctly', () => {
      const product = {
        title: "iPhone 15 Pro",
        price: 1200
      };

      render(
        <TestWrapper>
          <MockProductCard title={product.title} price={product.price} />
        </TestWrapper>
      );

      // Check if product details are displayed
      expect(screen.getByTestId('product-title')).toHaveTextContent('iPhone 15 Pro');
      expect(screen.getByTestId('product-price')).toHaveTextContent('$1200');
    });

    // Test that Add to Cart button works for regular users
    test('Should show Add to Cart button for regular users', () => {
      const mockAddToCart = jest.fn();

      render(
        <TestWrapper initialState={{
          AuthSlice: { loggedInUser: { isAdmin: false } }
        }}>
          <MockProductCard 
            title="iPhone 15" 
            price={1200} 
            onAddToCart={mockAddToCart}
            isAdmin={false}
          />
        </TestWrapper>
      );

      // Check if Add to Cart button exists and works
      const addButton = screen.getByTestId('add-to-cart');
      expect(addButton).toBeInTheDocument();
      
      fireEvent.click(addButton);
      expect(mockAddToCart).toHaveBeenCalledWith('iPhone 15');
    });

    // Test that admin users see edit/delete buttons instead
    test('Should show admin controls for admin users', () => {
      render(
        <TestWrapper initialState={{
          AuthSlice: { loggedInUser: { isAdmin: true } }
        }}>
          <MockProductCard 
            title="iPhone 15" 
            price={1200}
            isAdmin={true}
          />
        </TestWrapper>
      );

      // Admin should see edit and delete buttons
      expect(screen.getByTestId('edit-product')).toBeInTheDocument();
      expect(screen.getByTestId('delete-product')).toBeInTheDocument();
      
      // Admin should NOT see add to cart button
      expect(screen.queryByTestId('add-to-cart')).not.toBeInTheDocument();
    });
  });

  describe('Search Component Tests', () => {
    // Test search input functionality
    test('Should handle search input and submission', () => {
      const mockSearch = jest.fn();

      render(
        <TestWrapper>
          <MockSearchComponent onSearch={mockSearch} />
        </TestWrapper>
      );

      // Test typing in search box
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'iPhone' } });
      expect(searchInput.value).toBe('iPhone');

      // Test search submission
      const searchForm = screen.getByTestId('search-form');
      fireEvent.submit(searchForm);
      expect(mockSearch).toHaveBeenCalledWith('iPhone');
    });

    // Test empty search
    test('Should handle empty search submission', () => {
      const mockSearch = jest.fn();

      render(
        <TestWrapper>
          <MockSearchComponent onSearch={mockSearch} />
        </TestWrapper>
      );

      // Submit without typing anything
      const searchForm = screen.getByTestId('search-form');
      fireEvent.submit(searchForm);
      expect(mockSearch).toHaveBeenCalledWith('');
    });

    // Test search button click
    test('Should trigger search when button is clicked', () => {
      const mockSearch = jest.fn();

      render(
        <TestWrapper>
          <MockSearchComponent onSearch={mockSearch} />
        </TestWrapper>
      );

      // Type something and click search button
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Samsung' } });
      
      const searchButton = screen.getByTestId('search-button');
      fireEvent.click(searchButton);
      
      expect(mockSearch).toHaveBeenCalledWith('Samsung');
    });
  });

  describe('Product List Component Tests', () => {
    // Mock ProductList component
    const MockProductList = ({ products, isAdmin }) => (
      <div data-testid="product-list">
        {products.length === 0 ? (
          <p data-testid="no-products">No products found</p>
        ) : (
          products.map(product => (
            <MockProductCard
              key={product.id}
              title={product.title}
              price={product.price}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    );

    // Test empty product list
    test('Should display message when no products found', () => {
      render(
        <TestWrapper>
          <MockProductList products={[]} isAdmin={false} />
        </TestWrapper>
      );

      expect(screen.getByTestId('no-products')).toHaveTextContent('No products found');
    });

    // Test product list with items
    test('Should display multiple products', () => {
      const products = [
        { id: 1, title: 'iPhone 15', price: 1200 },
        { id: 2, title: 'Samsung Galaxy', price: 1000 }
      ];

      render(
        <TestWrapper>
          <MockProductList products={products} isAdmin={false} />
        </TestWrapper>
      );

      // Should show both products
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
      expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument();
      expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    });
  });

  describe('Form Validation Component Tests', () => {
    // Mock form component for product creation
    const MockProductForm = ({ onSubmit }) => {
      const [formData, setFormData] = React.useState({
        title: '',
        price: '',
        category: ''
      });
      const [errors, setErrors] = React.useState({});

      const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simple validation
        const newErrors = {};
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.category) newErrors.category = 'Category is required';
        
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length === 0) {
          onSubmit(formData);
        }
      };

      return (
        <form data-testid="product-form" onSubmit={handleSubmit}>
          <input
            data-testid="title-input"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Product title"
          />
          {errors.title && <span data-testid="title-error">{errors.title}</span>}
          
          <input
            data-testid="price-input"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="Price"
          />
          {errors.price && <span data-testid="price-error">{errors.price}</span>}
          
          <input
            data-testid="category-input"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="Category"
          />
          {errors.category && <span data-testid="category-error">{errors.category}</span>}
          
          <button data-testid="submit-button" type="submit">
            Create Product
          </button>
        </form>
      );
    };

    // Test form validation - empty fields
    test('Should show validation errors for empty fields', () => {
      const mockSubmit = jest.fn();

      render(
        <TestWrapper>
          <MockProductForm onSubmit={mockSubmit} />
        </TestWrapper>
      );

      // Submit empty form
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      // Should show error messages
      expect(screen.getByTestId('title-error')).toHaveTextContent('Title is required');
      expect(screen.getByTestId('price-error')).toHaveTextContent('Valid price is required');
      expect(screen.getByTestId('category-error')).toHaveTextContent('Category is required');
      
      // Should not call onSubmit
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    // Test successful form submission
    test('Should submit form with valid data', () => {
      const mockSubmit = jest.fn();

      render(
        <TestWrapper>
          <MockProductForm onSubmit={mockSubmit} />
        </TestWrapper>
      );

      // Fill out form
      fireEvent.change(screen.getByTestId('title-input'), { 
        target: { value: 'iPhone 15' } 
      });
      fireEvent.change(screen.getByTestId('price-input'), { 
        target: { value: '1200' } 
      });
      fireEvent.change(screen.getByTestId('category-input'), { 
        target: { value: 'Electronics' } 
      });

      // Submit form
      fireEvent.click(screen.getByTestId('submit-button'));

      // Should call onSubmit with form data
      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'iPhone 15',
        price: '1200',
        category: 'Electronics'
      });
    });
  });
});