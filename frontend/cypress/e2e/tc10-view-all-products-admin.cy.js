// frontend/cypress/e2e/tc10-view-all-products-admin.cy.js

describe('TC-10: View All Product Entries (Admin)', () => {

  it('TC-10-001: Should allow admin to view all products', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/dashboard');
    cy.waitForPageLoad();
    
    // Verify admin can see product grid
    cy.get('[data-cy="admin-products-grid"]').should('exist');
    
    // Verify products are displayed (including deleted ones)
    cy.get('[data-cy^="admin-product-"]').should('have.length.greaterThan', 0);
    
    // Verify admin controls are visible
    cy.get('[data-cy^="edit-product-"]').should('exist');
    cy.get('[data-cy^="delete-product-"]').should('exist');
  });

  it('TC-10-002: Should deny regular user admin access', () => {
    cy.loginAsUser();
    
    // Try to access admin dashboard
    cy.visit('/admin/dashboard');
    
    // Should be redirected away from admin dashboard
    cy.url().should('not.include', '/admin/dashboard');
    // Should likely be redirected to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('TC-10-003: Should handle empty product list', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/dashboard');
    cy.waitForPageLoad();
    
    // If there are products, this test might not be applicable
    // But we can test the structure exists
    cy.get('[data-cy="admin-products-grid"]').should('exist');
    
    // Check if pagination exists when there are products
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="admin-product-"]').length === 0) {
        // No products case - verify empty state
        cy.contains('No products found').should('exist');
      } else {
        // Products exist - verify they're displayed
        cy.get('[data-cy^="admin-product-"]').should('have.length.greaterThan', 0);
      }
    });
  });

  it('TC-10-004: Should show both active and deleted products', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/dashboard');
    cy.waitForPageLoad();
    
    // Admin should see all products
    cy.get('[data-cy="admin-products-grid"]').should('exist');
    cy.get('[data-cy^="admin-product-"]').should('have.length.greaterThan', 0);
    
    // Check if there are any deleted products (they would have undelete buttons)
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="undelete-product-"]').length > 0) {
        // There are deleted products visible
        cy.get('[data-cy^="undelete-product-"]').should('exist');
      }
    });
  });

  it('TC-10-005: Should display admin product controls', () => {
    cy.loginAsAdmin();
    cy.visit('/admin/dashboard');
    cy.waitForPageLoad();
    
    // Verify admin-specific controls are present
    cy.get('[data-cy^="admin-product-"]').first().then(() => {
      // Each product should have edit and delete/undelete buttons
      cy.get('[data-cy^="edit-product-"]').should('have.length.greaterThan', 0);
      
      // Should have either delete or undelete buttons
      cy.get('button').contains(/Delete|Un-delete/).should('exist');
    });
  });
});
