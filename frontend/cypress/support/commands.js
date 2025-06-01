// frontend/cypress/support/commands.js

// Command to login as admin
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.get('[data-cy="email-input"]').type('123@gmail.com'); // Update with your admin email
  cy.get('[data-cy="password-input"]').type('Lol1513256'); // Update with your admin password
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('include', '/admin/dashboard');
});

// Command to login as user
Cypress.Commands.add('loginAsUser', () => {
  cy.visit('/login');
  cy.get('[data-cy="email-input"]').type('1234@gmail.com');
  cy.get('[data-cy="password-input"]').type('Lol1513256');
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('include', '/');
});

// Command to fill product form
Cypress.Commands.add('fillProductForm', (productData) => {
  // Wait for form to be fully loaded
  cy.get('[data-cy="product-title"]').should('be.visible');
  
  // For react-hook-form TextFields, just type directly (no need to clear first)
  cy.get('[data-cy="product-title"]').type(productData.title);
  
  // Select first available brand
  cy.get('[data-cy="product-brand"]').click();
  cy.get('[role="option"]').first().click();
  
  // Select first available category  
  cy.get('[data-cy="product-category"]').click();
  cy.get('[role="option"]').first().click();
  
  // For multiline TextField (description)
  cy.get('[data-cy="product-description"]').type(productData.description);
  
  // For number TextFields
  cy.get('[data-cy="product-price"]').type(productData.price);
  cy.get('[data-cy="product-discount"]').type(productData.discount);
  cy.get('[data-cy="product-stock"]').type(productData.stock);
  
  // For URL TextFields
  cy.get('[data-cy="product-thumbnail"]').type(productData.thumbnail);
  cy.get('[data-cy="product-image-0"]').type(productData.images[0]);
  cy.get('[data-cy="product-image-1"]').type(productData.images[1]);
  cy.get('[data-cy="product-image-2"]').type(productData.images[2]);
  cy.get('[data-cy="product-image-3"]').type(productData.images[3]);
});

// Command to wait for loading to complete
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('not.contain', 'Loading');
});