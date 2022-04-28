/// <reference types="cypress"/>

context("Home", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should find the home page and find banner image", () => {
    cy.get('[alt="Ameciclo Banner"]')
      .should("be.visible")
      .and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
  });
});
