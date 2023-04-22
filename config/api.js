module.exports = ({ env }) => ({
  responses: {
    privateAttributes: ['createdAt']
  },
  rest: {
    prefix: '/v1',
    defaultLimit: 100,
    maxLimit: 250
  }
})
