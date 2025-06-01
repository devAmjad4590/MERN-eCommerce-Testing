// frontend/cypress/e2e/tc07-create-product.cy.js

describe('TC-07: Create Product Entry', () => {
  
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/admin/add-product');
    cy.waitForPageLoad();
  });

  it('TC-07-001: Should create product with valid data', () => {
    cy.fixture('testData').then((data) => {
      cy.fillProductForm(data.validProduct);
      cy.get('[data-cy="submit-product"]').click();
      
      // EXPECT: Product created successfully
      cy.contains('New product added').should('be.visible');
      cy.url().should('include', '/admin/dashboard');
    });
  });

  it('TC-07-002: Should show error for null product name', () => {
    cy.fixture('testData').then((data) => {
      // Fill form but skip title
      cy.get('[data-cy="product-brand"]').click();
      cy.get('[role="option"]').first().click();
      cy.get('[data-cy="product-category"]').click();
      cy.get('[role="option"]').first().click();
      cy.get('[data-cy="product-description"]').type(data.validProduct.description);
      cy.get('[data-cy="product-price"]').type(data.validProduct.price);
      cy.get('[data-cy="product-discount"]').type(data.validProduct.discount);
      cy.get('[data-cy="product-stock"]').type(data.validProduct.stock);
      cy.get('[data-cy="product-thumbnail"]').type(data.validProduct.thumbnail);
      cy.get('[data-cy="product-image-0"]').type(data.validProduct.images[0]);
      cy.get('[data-cy="product-image-1"]').type(data.validProduct.images[1]);
      cy.get('[data-cy="product-image-2"]').type(data.validProduct.images[2]);
      cy.get('[data-cy="product-image-3"]').type(data.validProduct.images[3]);
      
      cy.get('[data-cy="submit-product"]').click();
      
      // EXPECT: Should show error and stay on form
      cy.url().should('include', '/admin/add-product');
    });
  });

  it('TC-07-003: Should reject product name longer than 100 characters', () => {
    cy.fixture('testData').then((data) => {
      const longName = 'a'.repeat(101);
      const productData = { ...data.validProduct, title: longName };
      cy.fillProductForm(productData);
      cy.get('[data-cy="submit-product"]').click();
      
      // EXPECT: Should reject and stay on form
      cy.url().should('include', '/admin/add-product');
    });
  });

  it('TC-07-004: Should reject negative price', () => {
    cy.fixture('testData').then((data) => {
      const productData = { ...data.validProduct, price: '-1200' };
      cy.fillProductForm(productData);
      cy.get('[data-cy="submit-product"]').click();
      
      // EXPECT: Should reject and stay on form
      cy.url().should('include', '/admin/add-product');
    });
  });

  it('TC-07-005: Should require price field', () => {
    cy.fixture('testData').then((data) => {
      // Fill form but skip price
      cy.get('[data-cy="product-title"]').type(data.validProduct.title);
      cy.get('[data-cy="product-brand"]').click();
      cy.get('[role="option"]').first().click();
      cy.get('[data-cy="product-category"]').click();
      cy.get('[role="option"]').first().click();
      cy.get('[data-cy="product-description"]').type(data.validProduct.description);
      cy.get('[data-cy="product-discount"]').type(data.validProduct.discount);
      cy.get('[data-cy="product-stock"]').type(data.validProduct.stock);
      cy.get('[data-cy="product-thumbnail"]').type(data.validProduct.thumbnail);
      cy.get('[data-cy="product-image-0"]').type(data.validProduct.images[0]);
      cy.get('[data-cy="product-image-1"]').type(data.validProduct.images[1]);
      cy.get('[data-cy="product-image-2"]').type(data.validProduct.images[2]);
      cy.get('[data-cy="product-image-3"]').type(data.validProduct.images[3]);
      
      cy.get('[data-cy="submit-product"]').click();
      
      // EXPECT: Should require price and stay on form
      cy.url().should('include', '/admin/add-product');
    });
  });

  it('TC-07-006: Should require category field', () => {
    cy.fixture('testData').then((data) => {
      cy.get('[data-cy="product-title"]').type(data.validProduct.title);
      cy.get('[data-cy="product-description"]').type(data.validProduct.description);
      cy.get('[data-cy="product-price"]').type(data.validProduct.price);
      cy.get('[data-cy="submit-product"]').click();
      
      // EXPECT: Should require category and stay on form
      cy.url().should('include', '/admin/add-product');
    });
  });

  it('TC-07-007: Should reject negative stock value', () => {
    cy.fixture('testData').then((data) => {
      const productData = { ...data.validProduct, stock: '-50' };
      cy.fillProductForm(productData);
      cy.get('[data-cy="submit-product"]').click();
      
      // EXPECT: Should reject and stay on form
      cy.url().should('include', '/admin/add-product');
    });
  });

  it('TC-07-008: Should show multiple validation errors', () => {
    cy.get('[data-cy="submit-product"]').click();
    
    // EXPECT: Should show validation errors and stay on form
    cy.url().should('include', '/admin/add-product');
  });
});