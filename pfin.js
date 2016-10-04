// get wagner for dependency injection between node modules
var wagner = require('wagner-core');

// grab all dependencies needed and execute then with (wagner) call
require('./server/dependencies')(wagner);

// grab all Mongoose models with wagner and execute them with (wagner) call
require( './server/models/model')(wagner);

// get server object already configured from my 'server.js' file
var server = require('./server');

// configure port, that server will listen: try to use environment variables (if any). Otherwise, use 3000.
var port = wagner.invoke( function(Config) { return Config }).express.serverPort || 3000;

server.listen(port);

console.log("api pfin started!");


