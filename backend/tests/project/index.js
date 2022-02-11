const request = require("supertest");
const { isDraft } = require("strapi-utils").contentTypes;

let projectId;

beforeAll(async (done) => {
  jest.setTimeout(15000);
  let data = {
    name: "Projeto",
    goal: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse non orci ve",
    status: "ongoing",
    bikeCulture: "high",
    instArticulation: "low",
    politicIncidence: "medium",
  };

  try {
    const validData = await strapi.entityValidator.validateEntityCreation(
      strapi.models.project,
      data,
      { isDraft: isDraft(data, strapi.models.project) }
    );
    const project = await strapi.query("project").create(validData);
    projectId = project.id;
  } catch (e) {
    console.log(e.data.errors);
  }
  done();
});

describe("test projects", () => {
  it("should return projects", async (done) => {
    await request(strapi.server) // app server is an instance of Class: http.Server
      .get("/projects")
      .expect(200) // Expect response http code 200
      .then((data) => {
        expect(data.body[0].id).toBe(projectId); // expect the response text
      });
    done();
  });
});
