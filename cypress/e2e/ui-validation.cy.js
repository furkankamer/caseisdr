describe('Horse Racing Game - UI Validation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Layout and Structure', () => {
    it('should have three-panel layout', () => {
      // Left panel - Horse List
      cy.get('.left-panel').should('be.visible');
      cy.contains('Horse List (1-20)').should('be.visible');
      
      // Center panel - Race Track
      cy.get('.center-panel').should('be.visible');
      
      // Right panel - Program/Results
      cy.get('.right-panel').should('be.visible');
      cy.contains('Program').should('be.visible');
      cy.contains('Results').should('be.visible');
    });

    it('should have header with buttons', () => {
      cy.get('.header').should('be.visible');
      cy.contains('Horse Racing').should('be.visible');
      cy.contains('GENERATE PROGRAM').should('be.visible');
      cy.contains('START').should('be.visible');
    });
  });

  describe('Horse List Display', () => {
    it('should show all horse details', () => {
      cy.get('.horse-table thead th').should('contain', 'Name');
      cy.get('.horse-table thead th').should('contain', 'Condition');
      cy.get('.horse-table thead th').should('contain', 'Color');
    });

    it('should display horse names', () => {
      cy.get('.horse-table tbody tr').first().within(() => {
        cy.get('td').first().should('not.be.empty');
      });
    });

    it('should show color indicators', () => {
      cy.get('.color-box').should('have.length', 20);
      cy.get('.color-box').first().should('have.css', 'background-color');
    });
  });

  describe('Race Track Display', () => {
    beforeEach(() => {
      cy.contains('GENERATE PROGRAM').click();
      cy.wait(100);
    });

    it('should show empty state before race starts', () => {
      cy.get('.empty-state').should('be.visible');
      cy.contains('Generate a program and click START').should('be.visible');
    });

    it('should show race info when racing', () => {
      cy.contains('START').click();
      cy.contains('Program').click();
      cy.contains('1st Lap - 1200m').should('be.visible');
      cy.get('.lanes').should('be.visible');
      cy.contains('FINISH').should('be.visible');
    });

    it('should show 10 lanes', () => {
      cy.contains('START').click();
      
      cy.get('.lane').should('have.length', 10);
      cy.get('.lane-number').should('have.length', 10);
    });

    it('should show lane numbers 1-10', () => {
      cy.contains('START').click();
      
      cy.get('.lane-number').each(($el, index) => {
        expect($el.text()).to.equal((index + 1).toString());
      });
    });
  });

  describe('Program Panel', () => {
    beforeEach(() => {
      cy.contains('GENERATE PROGRAM').click();
      cy.wait(100);
    });

    it('should show all 6 rounds', () => {
      cy.get('.round-card').should('have.length', 6);
    });

    it('should highlight current round', () => {
      cy.contains('START').click();
      
      // Wait for race to start and first round to become active
      cy.wait(500);
      
      // Click Program tab to see the round cards (race start switches to Results)
      cy.contains('Program').click();
      
      // Verify round cards still exist
      cy.get('.round-card').should('have.length', 6);
      
      // Check that at least one round has the active class
      cy.get('.round-card.active').should('exist');
    });

    it('should show correct distances', () => {
      const distances = [1200, 1400, 1600, 1800, 2000, 2200];
      
      cy.get('.round-card').each(($card, index) => {
        cy.wrap($card).should('contain', `${distances[index]}m`);
      });
    });
  });

  describe('Results Panel', () => {
    beforeEach(() => {
      cy.contains('GENERATE PROGRAM').click();
      cy.wait(100);
    });

    it('should show empty state before races', () => {
      cy.contains('Results').click();
      cy.contains('No results yet').should('be.visible');
    });

    it('should show results after race completes', () => {
      cy.contains('START').click();
      
      // Wait for first round
      cy.wait(15000);
      
      cy.contains('Results').click();
      cy.get('.result-card').should('exist');
    });

    it('should show positions 1-10 in results', () => {
      cy.contains('START').click();
      cy.wait(15000);
      
      cy.contains('Results').click();
      
      // Get the first result card and check it contains positions
      cy.get('.result-card').first().within(() => {
        // Check that position cells exist and contain numbers 1-10
        cy.get('.position').should('have.length', 10);
        
        // Verify each position
        cy.get('.position').each(($el, index) => {
          expect($el.text().trim()).to.equal((index + 1).toString());
        });
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle viewport changes', () => {
      // Test desktop
      cy.viewport(1280, 720);
      cy.get('.main-layout').should('be.visible');
      
      // Test smaller viewport
      cy.viewport(1024, 768);
      cy.get('.main-layout').should('be.visible');
    });
  });

  describe('Button States', () => {
    it('should disable START button initially', () => {
      cy.contains('START').should('be.disabled');
    });

    it('should enable START after program generation', () => {
      cy.contains('GENERATE PROGRAM').click();
      cy.contains('START').should('not.be.disabled');
    });

    it('should change START to PAUSE during race', () => {
      cy.contains('GENERATE PROGRAM').click();
      cy.contains('START').click();
      
      cy.contains('PAUSE').should('be.visible');
      cy.contains('START').should('not.exist');
    });

    it('should change PAUSE back to START when paused', () => {
      cy.contains('GENERATE PROGRAM').click();
      cy.contains('START').click();
      
      cy.wait(500);
      cy.contains('PAUSE').click();
      
      // Button should show START again (for resume)
      cy.contains('START').should('be.visible');
    });
  });
});