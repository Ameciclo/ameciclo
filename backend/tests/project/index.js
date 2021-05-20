const request = require('supertest');

it('should return projects', async done => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .get('/projects')
    .expect(200) // Expect response http code 200
    .then(data => {
      expect(Array.isArray(data.body)).toBeTruthy(); // expect the response text
    });
  done();
});