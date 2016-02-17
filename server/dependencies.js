// Here I register all services,that I will further invoke in other files with wagner.invoke

function dependencies( wagner ) {
    // first I need to read config from file, so I grab fs
    var fs = require( 'fs' );
    // now I register Config service, that reads content of the JSON and returns it as object
    wagner.factory( 'Config', function() {
        return JSON.parse( fs.readFileSync( './server/config.json' ).toString() );
    });

};

module.exports = dependencies;