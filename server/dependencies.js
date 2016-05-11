// Here I register all services,that I will further invoke in other files with wagner.invoke

function dependencies( wagner ) {
    // 1. Register Config service
    // first I need to read config from file, so I grab fs
    var fs = require( 'fs' );
    // now I register Config service, that reads content of the JSON and returns it as object
    wagner.factory( 'Config', function() {
        var s = JSON.parse( fs.readFileSync( './server/config.json' ).toString() );

        // > getter for chart meta data based on chart name
        s.getChartTraces = function (chartDiv){
            var meta = s.plotly.find( function (item){
                return item.chartDiv === chartDiv;
            }).traces;

            return meta;
        };

        s.getConfigFor = function(propertyName) {
            return s[propertyName];
        }

        return s;
    });

};

module.exports = dependencies;