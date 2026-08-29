require('dotenv').config();
const config = require('./config');
const target = process.argv[2];

console.log(`Target argument: ${target}`);
console.log(`Config loaded with API key: ${config.apiKey}`);
