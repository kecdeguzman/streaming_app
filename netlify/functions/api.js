const serverless = require('serverless-http');
const app = require('../../server');

// Netlify Functions serverless handler
module.exports.handler = serverless(app);
