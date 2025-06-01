// frontend/cypress/e2e/tc08-edit-product.cy.js

describe('TC-08: Edit Product Entry', () => {
  let productId;

  before(() => {
    cy.loginAsAdmin();
    cy.visit('/admin/dashboard');
    cy.waitForPageLoad();
    
    cy.get('[data-cy^="admin-product-"]').first().then(($product) => {
      productId = $product.attr('data-cy').replace('admin-product-', '');
    });
  });

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('TC-08-001: Should update product with valid data', () => {
    cy.visit(`/admin/product-update/${productId}`);
    cy.waitForPageLoad();
    
    cy.get('[data-cy="product-title"] input').clear().type('Updated iPhone 14 Pro Max');
    cy.get('[data-cy="product-price"] input').clear().type('1400');
    cy.get('[data-cy="submit-product"]').click();
    
    // EXPECT: Product updated successfully
    cy.contains('Product Updated').should('be.visible');
    cy.url().should('include', '/admin/dashboard');
  });

  it('TC-08-002: Should handle non-existent product ID', () => {
    const nonExistentId = '507f1f77bcf86cd799439999';
    cy.visit(`/admin/product-update/${nonExistentId}`);
    
    // EXPECT: Should show error for non-existent product
    cy.contains('Error fetching product details').should('be.visible');
  });

  it('TC-08-003: Should require product ID', () => {
    cy.visit('/admin/product-update/');
    
    // EXPECT: Should redirect or show error for missing ID
    cy.url().should('not.include', '/admin/product-update/');
  });

  it('TC-08-004: Should accept minimum valid price (0.01)', () => {
    cy.visit(`/admin/product-update/${productId}`);
    cy.waitForPageLoad();
    
    cy.get('[data-cy="product-price"] input').clear().type('0.01');
    cy.get('[data-cy="submit-product"]').click();
    
    // EXPECT: Should accept minimum price
    cy.contains('Product Updated').should('be.visible');
  });

  it('TC-08-005: Should accept zero stock (out of stock)', () => {
    cy.visit(`/admin/product-update/${productId}`);
    cy.waitForPageLoad();
    
    cy.get('[data-cy="product-stock"] input').clear().type('0');
    cy.get('[data-cy="submit-product"]').click();
    
    // EXPECT: Should accept zero stock
    cy.contains('Product Updated').should('be.visible');
  });

  it('TC-08-006: Should validate required fields on update', () => {
    cy.visit(`/admin/product-update/${productId}`);
    cy.waitForPageLoad();
    
    cy.get('[data-cy="product-title"] input').clear();
    cy.get('[data-cy="submit-product"]').click();
    
    // EXPECT: Should show validation error for empty title
    cy.url().should('include', `/admin/product-update/${productId}`);
  });
});
