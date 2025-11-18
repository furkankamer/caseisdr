// Cypress E2E support file

// Disable uncaught exception handling for Vue warnings
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // Only ignore Vue hydration warnings
  if (err.message.includes('Hydration')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});