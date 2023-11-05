'use strict';
const app = require('./app');
const serverless = reqiure('serverless-http');
module.exports.hello = serverless(app);

