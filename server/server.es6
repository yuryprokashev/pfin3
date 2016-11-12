// require Express
var express = require( 'express' );

// grab warner to install server features from separate modules
var wagner = require( 'wagner-core' );


// create express server, I call it 'server'
var server = express();

// use 'static' middleware to serve static files from server
// static files will be accessible from 'client' folder on server by requesting '/assets' in url
server.use( '/assets', express.static( __dirname + '/client' ) );

// deliver home page on '/' get request
server.get('/', function( req, res ) {
    var path = require ('path' );
    var file = path.join(__dirname, './client/templates/', 'index.html');
    res.sendFile( file );
});

// grab and install auth module to server
wagner.invoke( require( './auth' ), { server: server } );

// server.use(require('./server/facebookAuth'));
wagner.invoke(require('./server/facebookAuth'), {server: server});

// grab api version for server
server.use( '/api/v1', require( './api' )( wagner ) );

module.exports = server;