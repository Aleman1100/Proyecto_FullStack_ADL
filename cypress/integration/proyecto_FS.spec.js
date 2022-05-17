describe("Index Proyecto", () => {
    it("frontepage can be opened", () => {
        cy.visit("http://localhost:3000/");
        cy.contains("Agenda Virtual Samus Bacquet");
    });

    it("Click test Boton Registro", () => {
        cy.visit("http://localhost:3000/Registro");
        cy.contains("Registrar").click()
    })

    it("Click test Email Login", () => {
        cy.visit("http://localhost:3000/Login");
        cy.get("input:first").type("ejemplo@gmail.com")
    });

    it("Click test Password Login", () => {
        cy.visit("http://localhost:3000/Login");
        cy.get('input[name="password"]').type("qwe")
    });

    it("Cambio de sección", () => {
        cy.visit("http://localhost:3000/");
        cy.contains("Recreo").click()
    })
});