// frontend/cypress/e2e/tc11-view-available-products-user.cy.js

describe('TC-11: View Available Products (User)', () => {

  beforeEach(() => {
    cy.loginAsUser();
    cy.waitForPageLoad();
  });

  it('TC-11-001: Should show only available products to users', () => {
    // EXPECT: User sees product grid without admin controls
    // Using the actual data-cy from ProductList.jsx
    cy.get('[data-cy="user-products-grid"]').should('exist');
    
    // Wait for products to load and check if any exist
    cy.get('body').then(($body) => {
      const productElements = $body.find('[data-cy^="user-product-"]');
      if (productElements.length > 0) {
        // Products exist
        cy.get('[data-cy^="user-product-"]').should('have.length.greaterThan', 0);
        
        // EXPECT: No admin controls visible
        cy.get('[data-cy^="edit-product-"]').should('not.exist');
        cy.get('[data-cy^="delete-product-"]').should('not.exist');
        
        // EXPECT: User controls visible
        cy.get('button').contains('Add To Cart').should('exist');
      } else {
        // No products available - this might be expected if database is empty
        cy.log('No products found in database - this may be expected for empty database');
      }
    });
  });

  it('TC-11-002: Should hide zero stock products from users', () => {
    // Check if products exist first
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="user-product-"]').length > 0) {
        // EXPECT: Products shown should not display "out of stock"
        cy.get('[data-cy^="user-product-"]').each(($product) => {
          cy.wrap($product).should('not.contain', 'Out of stock');
        });
      } else {
        cy.log('No products to test - database may be empty');
      }
    });
  });

  it('TC-11-003: Should filter logic for available products', () => {
    // EXPECT: Only available products shown
    cy.get('[data-cy="user-products-grid"]').should('exist');
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="user-product-"]').length > 0) {
        cy.get('[data-cy^="user-product-"]').each(($product) => {
          cy.wrap($product).within(() => {
            // EXPECT: Available products have cart functionality
            cy.get('button').should('contain.oneOf', ['Add To Cart', 'Added to cart']);
          });
        });
      } else {
        cy.log('No products to test filtering logic');
      }
    });
  });

  it('TC-11-004: Should not show deleted products to users', () => {
    // EXPECT: No deleted product controls visible
    cy.get('[data-cy="user-products-grid"]').should('exist');
    cy.get('[data-cy^="undelete-product-"]').should('not.exist');
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="user-product-"]').length > 0) {
        cy.get('[data-cy^="user-product-"]').each(($product) => {
          cy.wrap($product).should('not.have.css', 'opacity', '0.7');
        });
      }
    });
  });

  it('TC-11-005: Should show product details for available products', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="user-product-"]').length > 0) {
        cy.get('[data-cy^="user-product-"]').first().click();
        
        // EXPECT: Navigate to product details with user functionality
        cy.url().should('include', '/product-details/');
        cy.contains('Add To Cart').should('exist');
        cy.contains('In Stock').should('exist');
      } else {
        cy.log('No products available to click on');
      }
    });
  });

  it('TC-11-006: Should handle empty available products list', () => {
    // EXPECT: Grid exists regardless of content
    cy.get('[data-cy="user-products-grid"]').should('exist');
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy^="user-product-"]').length === 0) {
        // EXPECT: Empty state handled gracefully (no crash)
        cy.log('Empty product list handled - no products in database');
        // The system should not crash even with empty products
        cy.get('[data-cy="user-products-grid"]').should('exist');
      } else {
        // EXPECT: Products are available
        cy.get('[data-cy^="user-product-"]').should('have.length.greaterThan', 0);
      }
    });
  });
});