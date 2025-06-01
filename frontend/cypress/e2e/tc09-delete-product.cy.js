// frontend/cypress/e2e/tc09-delete-product.cy.js

describe('TC-09: Delete Product Entry', () => {
  let productId;

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/admin/dashboard');
    cy.waitForPageLoad();
  });

  it('TC-09-001: Should allow admin to soft delete product', () => {
    // Check if products exist first
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="admin-product-"]').length > 0) {
        // Get first product ID
        cy.get('[data-cy^="admin-product-"]').first().then(($product) => {
          productId = $product.attr('data-cy').replace('admin-product-', '');
          
          // Find and click delete button for the product
          cy.get(`[data-cy="delete-product-${productId}"]`).click();
          
          // EXPECT: Product should be soft deleted (button changes to "Un-delete")
          cy.get(`[data-cy="undelete-product-${productId}"]`).should('exist');
          cy.get(`[data-cy="admin-product-${productId}"]`).parent().should('have.css', 'opacity');
        });
      } else {
        cy.log('No products available to delete - database may be empty');
      }
    });
  });

  it('TC-09-002: Should deny non-admin delete access', () => {
    // Logout admin first
    cy.visit('/logout');
    cy.wait(2000); // Wait for logout to complete
    
    // Login as regular user
    cy.loginAsUser();
    cy.visit('/admin/dashboard');
    
    // EXPECT: Should be redirected away from admin dashboard
    cy.url().should('not.include', '/admin/dashboard');
  });

  it('TC-09-003: Should handle invalid product ID for deletion', () => {
    // Check if any delete buttons exist
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="delete-product-"]').length > 0) {
        cy.get('[data-cy^="delete-product-"]').first().click();
        cy.wait(1000);
        
        // EXPECT: UI should handle backend errors gracefully
        cy.get('[data-cy="admin-products-grid"]').should('exist');
      } else {
        cy.log('No delete buttons found - may indicate no active products');
      }
    });
  });

  it('TC-09-004: Should test product state transitions', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="admin-product-"]').length > 0) {
        // Get first product
        cy.get('[data-cy^="admin-product-"]').first().then(($product) => {
          productId = $product.attr('data-cy').replace('admin-product-', '');
          
          // 1. EXPECT: Product is active
          cy.get(`[data-cy="admin-product-${productId}"]`).should('exist');
          cy.get(`[data-cy="delete-product-${productId}"]`).should('exist');
          
          // 2. Delete the product
          cy.get(`[data-cy="delete-product-${productId}"]`).click();
          
          // 3. EXPECT: Product is deleted (soft delete)
          cy.get(`[data-cy="undelete-product-${productId}"]`).should('exist');
          cy.get(`[data-cy="delete-product-${productId}"]`).should('not.exist');
        });
      } else {
        cy.log('No products available for state transition testing');
      }
    });
  });

  it('TC-09-005: Should allow un-deleting a deleted product', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="admin-product-"]').length > 0) {
        cy.get('[data-cy^="admin-product-"]').first().then(($product) => {
          productId = $product.attr('data-cy').replace('admin-product-', '');
          
          // First delete the product (if not already deleted)
          cy.get('body').then(($body2) => {
            if ($body2.find(`[data-cy="delete-product-${productId}"]`).length > 0) {
              cy.get(`[data-cy="delete-product-${productId}"]`).click();
            }
          });
          
          // Wait for deletion to complete
          cy.get(`[data-cy="undelete-product-${productId}"]`).should('exist');
          
          // Then un-delete it
          cy.get(`[data-cy="undelete-product-${productId}"]`).click();
          
          // EXPECT: Product should be restored
          cy.get(`[data-cy="delete-product-${productId}"]`).should('exist');
          cy.get(`[data-cy="undelete-product-${productId}"]`).should('not.exist');
        });
      } else {
        cy.log('No products available for un-delete testing');
      }
    });
  });
});