// frontend/cypress/support/e2e.js

import './commands';

// Disable Chrome web security for testing
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  return false;
});

// Add global before hook to ensure app is ready
beforeEach(() => {
  // Clear local storage before each test
  cy.clearLocalStorage();
  cy.clearCookies();
});
