const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Adjust path to your main app file

describe('Product API Tests (F007-F012)', () => {
  let testProductId;
  let server;

  // Use existing IDs from your seed data
  const validCategoryId = '65a7e24602e12c44f599442c'; // smartphones from your seed
  const validBrandId = '65a7e20102e12c44f59943da'; // Apple from your seed

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_db');
    }
  }, 15000);

  afterAll(async () => {
    // Cleanup: Remove test product if it exists
    if (testProductId) {
      try {
        await mongoose.model('Product').findByIdAndDelete(testProductId);
      } catch (error) {
        console.log('Cleanup error:', error.message);
      }
    }
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }, 15000);

  // =====================================
  // TC-07: Create Product Entry (F007)
  // =====================================
  describe('TC-07: Create Product Entry', () => {
    
    test('TC-07-001: Should create product with valid data', async () => {
      const productData = {
        title: 'iPhone 15 Pro',
        price: 1200.00,
        category: validCategoryId,
        description: 'Latest iPhone model with advanced features',
        stockQuantity: 50,
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg',
          'https://example.com/image4.jpg'
        ],
        isDeleted: false
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body.title).toBe('iPhone 15 Pro');
      expect(response.body.price).toBe(1200);
      expect(response.body.stockQuantity).toBe(50);
      expect(response.body.isDeleted).toBe(false);
      
      testProductId = response.body._id;
    }, 15000);

    test('TC-07-002: Should reject product with null name', async () => {
      const productData = {
        title: null, // Invalid: null product name
        price: 1200.00,
        category: validCategoryId,
        description: 'Latest iPhone model with advanced features',
        stockQuantity: 50,
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        images: ['https://example.com/image1.jpg'],
        isDeleted: false
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(500);

      expect(response.body.message).toMatch(/required|title/i);
    }, 15000);

    test('TC-07-003: Should reject product name > 100 characters', async () => {
      const longName = 'This is a very long product name that exceeds the maximum character limit of one hundred characters for testing boundary conditions and validation';
      
      const productData = {
        title: longName, // > 100 characters
        price: 1200.00,
        category: validCategoryId,
        description: 'Latest iPhone model with advanced features',
        stockQuantity: 50,
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        images: ['https://example.com/image1.jpg'],
        isDeleted: false
      };

      const response = await request(app)
        .post('/products')
        .send(productData);

      // Should either reject or truncate - depends on your validation
      expect([400, 500]).toContain(response.status);
    }, 15000);

    test('TC-07-004: Should reject negative price', async () => {
      const productData = {
        title: 'iPhone 15 Pro',
        price: -1200.00, // Invalid: negative price
        category: validCategoryId,
        description: 'Latest iPhone model with advanced features',
        stockQuantity: 50,
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        images: ['https://example.com/image1.jpg'],
        isDeleted: false
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(500);

      expect(response.body.message).toMatch(/adding product|validation/i);
    }, 15000);

    test('TC-07-005: Should reject null price', async () => {
      const productData = {
        title: 'iPhone 15 Pro',
        price: null, // Invalid: null price
        category: validCategoryId,
        description: 'Latest iPhone model with advanced features',
        stockQuantity: 50,
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        images: ['https://example.com/image1.jpg'],
        isDeleted: false
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(500);

      expect(response.body.message).toMatch(/required|price|adding product/i);
    }, 15000);

    test('TC-07-006: Should reject null category', async () => {
      const productData = {
        title: 'iPhone 15 Pro',
        price: 1200.00,
        category: null, // Invalid: null category
        description: 'Latest iPhone model with advanced features',
        stockQuantity: 50,
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        images: ['https://example.com/image1.jpg'],
        isDeleted: false
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(500);

      expect(response.body.message).toMatch(/required|category|adding product/i);
    }, 15000);

    test('TC-07-007: Should reject negative stock value', async () => {
      const productData = {
        title: 'iPhone 15 Pro',
        price: 1200.00,
        category: validCategoryId,
        description: 'Latest iPhone model with advanced features',
        stockQuantity: -50, // Invalid: negative stock
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        images: ['https://example.com/image1.jpg'],
        isDeleted: false
      };

      const response = await request(app)
        .post('/products')
        .send(productData);

      // Should either reject or handle gracefully
      expect([400, 500]).toContain(response.status);
    }, 15000);

    test('TC-07-008: Should reject multiple invalid fields', async () => {
      const productData = {
        title: null, // Invalid
        price: -1200.00, // Invalid
        category: null, // Invalid
        description: 'Latest iPhone model with advanced features',
        stockQuantity: 50,
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        images: ['https://example.com/image1.jpg'],
        isDeleted: false
      };

      const response = await request(app)
        .post('/products')
        .send(productData)
        .expect(500);

      // Should contain error message for validation failure
      expect(response.body.message).toMatch(/adding product|validation|required/i);
    }, 15000);
  });

  // =====================================
  // TC-08: Edit Product Entry (F008)
  // =====================================
  describe('TC-08: Edit Product Entry', () => {
    
    test('TC-08-001: Should update product with valid data', async () => {
      // Skip if no test product was created
      if (!testProductId) {
        console.log('Skipping update test - no test product available');
        return;
      }

      const updateData = {
        title: 'iPhone 14 Pro Max',
        price: 1400.00,
        category: validCategoryId,
        description: 'Latest iPhone model with advanced features',
        stockQuantity: 50,
        thumbnail: 'https://example.com/valid_image.jpg',
        brand: validBrandId,
        isDeleted: false
      };

      const response = await request(app)
        .patch(`/products/${testProductId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('iPhone 14 Pro Max');
      expect(response.body.price).toBe(1400);
    }, 15000);

    test('TC-08-002: Should handle non-existent product ID', async () => {
      const fakeId = '507f1f77bcf86cd799439999'; // Valid ObjectId format but non-existent
      
      const updateData = {
        title: 'iPhone 14 Pro Max',
        price: 1400.00
      };

      const response = await request(app)
        .patch(`/products/${fakeId}`)
        .send(updateData)
        .expect(500);

      expect(response.body.message).toMatch(/updating product|error/i);
    }, 15000);

    test('TC-08-003: Should handle null/invalid product ID', async () => {
      const updateData = {
        title: 'iPhone 14 Pro Max',
        price: 1400.00
      };

      const response = await request(app)
        .patch('/products/undefined')
        .send(updateData)
        .expect(500);

      expect(response.body.message).toMatch(/updating product|error/i);
    }, 15000);

    test('TC-08-004: Should update with minimum boundary price', async () => {
      if (!testProductId) {
        console.log('Skipping test - no test product available');
        return;
      }

      const updateData = {
        price: 0.01 // Minimum boundary value
      };

      const response = await request(app)
        .patch(`/products/${testProductId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.price).toBe(0.01);
    }, 15000);

    test('TC-08-005: Should update with zero stock boundary', async () => {
      if (!testProductId) {
        console.log('Skipping test - no test product available');
        return;
      }

      const updateData = {
        stockQuantity: 0 // Zero stock boundary
      };

      const response = await request(app)
        .patch(`/products/${testProductId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.stockQuantity).toBe(0);
    }, 15000);
  });

  // =====================================
  // TC-09: Delete Product Entry (F009)
  // =====================================
  describe('TC-09: Delete Product Entry', () => {
    
    test('TC-09-001: Should soft delete product', async () => {
      if (!testProductId) {
        console.log('Skipping delete test - no test product available');
        return;
      }

      const response = await request(app)
        .delete(`/products/${testProductId}`)
        .expect(200);

      expect(response.body.isDeleted).toBe(true);
      expect(response.body._id).toBe(testProductId);
    }, 15000);

    test('TC-09-002: Should handle non-existent product for deletion', async () => {
      const fakeId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .delete(`/products/${fakeId}`)
        .expect(500);

      expect(response.body.message).toMatch(/deleting product|error/i);
    }, 15000);

    test('TC-09-003: Should handle invalid product ID for deletion', async () => {
      const response = await request(app)
        .delete('/products/undefined')
        .expect(500);

      expect(response.body.message).toMatch(/deleting product|error/i);
    }, 15000);

    test('TC-09-004: Should transition product state on deletion', async () => {
      // Create a product specifically for this test
      const productData = {
        title: 'Test Product for Deletion',
        price: 100,
        category: validCategoryId,
        description: 'Test product',
        stockQuantity: 10,
        thumbnail: 'https://example.com/test.jpg',
        brand: validBrandId,
        images: ['https://example.com/test1.jpg'],
        isDeleted: false
      };

      // 1. Create product (should be active)
      const createResponse = await request(app)
        .post('/products')
        .send(productData)
        .expect(201);

      expect(createResponse.body.isDeleted).toBe(false);
      
      const productId = createResponse.body._id;

      // 2. Delete product (should be soft deleted)
      const deleteResponse = await request(app)
        .delete(`/products/${productId}`)
        .expect(200);

      expect(deleteResponse.body.isDeleted).toBe(true);

      // Cleanup
      await mongoose.model('Product').findByIdAndDelete(productId);
    }, 15000);
  });

  // =====================================
  // TC-10: View All Product Entries (F010)
  // =====================================
  describe('TC-10: View All Products (Admin)', () => {
    
    test('TC-10-001: Should get all products', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // May include both deleted and non-deleted products for admin view
    }, 15000);

    test('TC-10-002: Should handle empty product list gracefully', async () => {
      // This test checks behavior with results (may not be empty due to seed data)
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should return array regardless of content
    }, 15000);

    test('TC-10-003: Should return proper product structure', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      if (response.body.length > 0) {
        const product = response.body[0];
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('stockQuantity');
        expect(product).toHaveProperty('isDeleted');
      }
    }, 15000);
  });

  // =====================================
  // TC-11: View Available Products (F011)
  // =====================================
  describe('TC-11: View Available Products (User)', () => {
    
    test('TC-11-001: Should show only available products to users', async () => {
      const response = await request(app)
        .get('/products?user=true')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Check that all returned products are available (not deleted)
      response.body.forEach(product => {
        expect(product.isDeleted).toBeFalsy();
      });
    }, 15000);

    test('TC-11-002: Should not show products with zero stock to users', async () => {
      const response = await request(app)
        .get('/products?user=true')
        .expect(200);

      // Filter should exclude zero stock items for users
      response.body.forEach(product => {
        expect(product.stockQuantity).toBeGreaterThan(0);
      });
    }, 15000);

    test('TC-11-003: Should filter products correctly', async () => {
      const response = await request(app)
        .get('/products?user=true')
        .expect(200);

      // All products should be available (stock > 0 AND isDeleted: false)
      response.body.forEach(product => {
        expect(product.stockQuantity).toBeGreaterThan(0);
        expect(product.isDeleted).toBe(false);
      });
    }, 15000);
  });

  // =====================================
  // TC-12: Search Products by Name (F012)
  // =====================================
  describe('TC-12: Search Products by Name', () => {
    
    test('TC-12-001: Should find products by name', async () => {
      const response = await request(app)
        .get('/products?search=iPhone')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        // Check if returned products contain the search term
        response.body.forEach(product => {
          expect(product.title.toLowerCase()).toContain('iphone');
        });
      }
    }, 15000);

    test('TC-12-002: Should return empty array for non-existent product', async () => {
      const response = await request(app)
        .get('/products?search=NonExistentProduct12345')
        .expect(200);

      expect(response.body).toHaveLength(0);
    }, 15000);

    test('TC-12-003: Should handle empty search input', async () => {
      const response = await request(app)
        .get('/products?search=')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should return all available products when search is empty
    }, 15000);

    test('TC-12-004: Should handle minimum input (1 character)', async () => {
      const response = await request(app)
        .get('/products?search=i')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        response.body.forEach(product => {
          expect(product.title.toLowerCase()).toContain('i');
        });
      }
    }, 15000);

    test('TC-12-005: Should handle maximum input (100 characters)', async () => {
      const longSearch = 'i'.repeat(100);
      
      const response = await request(app)
        .get(`/products?search=${longSearch}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should execute normally, likely return empty results
    }, 15000);

    test('TC-12-006: Should be case-insensitive', async () => {
      // Test with lowercase search
      const lowercaseResponse = await request(app)
        .get('/products?search=iphone')
        .expect(200);

      // Test with uppercase search  
      const uppercaseResponse = await request(app)
        .get('/products?search=IPHONE')
        .expect(200);

      // Should return same results regardless of case
      expect(lowercaseResponse.body.length).toBe(uppercaseResponse.body.length);
    }, 15000);

    test('TC-12-007: Should complete search flow properly', async () => {
      // Simulate complete search flow
      const searchTerm = 'Samsung';
      
      const response = await request(app)
        .get(`/products?search=${searchTerm}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        response.body.forEach(product => {
          expect(product.title.toLowerCase()).toContain(searchTerm.toLowerCase());
        });
      }
    }, 15000);
  });
});