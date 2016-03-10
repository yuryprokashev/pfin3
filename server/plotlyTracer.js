module.exports = function( wagner ) {

    var s = {};
    var MyDates = wagner.invoke( function(MyDates) { return MyDates } );

    // gets db query results in arr of { _id, traceName }
    // gets traceName as sting
    // gets type of chart as string to be used for plotly.js. E.g. 'bar', 'scatter'.
    // gets monthId as string
    // outputs arr into plotly trace of { x: [ _id1, _id2..], y: [value 1, value 2], type }
    s.makePlotlyTrace = function( traceName, arr, monthIdString ) {
        // 1. Setup
        var trace = {};

        // 2. Logic
        if( traceName === 'dailyVolumes' ) {
            trace = dailyVolumesTrace( arr, monthIdString );
        }
        else if ( traceName === 'monthlySpentSpeed' ){
            trace = monthlySpentSpeedTrace( arr, monthIdString );
        }
        else if ( traceName === 'volumesByCategory' ){
            trace = volumesByCategoryTrace( arr, monthIdString );
        }
        else if (traceName === 'expenseFrequency' ){
            trace = expenseFrequencyTrace( arr, monthIdString );
        }
        else {
            console.log('invalid traceName');
        }

        // 3. Result
        return trace;
    };

    // helper functions
    var dailyVolumesTrace = function( arr, monthIdString ) {
        // 1. Setup
        var trace = { x: [], y: [], type: 'bar' };
        // 2. Logic
        for( var i = 1; i <= MyDates.getDaysInSelectedMonth( monthIdString ); i++ ) {
            trace.x.push( i );

            if(!trace.y[i-1]) {
                for( var j in arr ) {
                    if( arr[j]._id === i){ trace.y[i-1] = arr[j]['dailyVolumes']; break; }
                    else { trace.y[i-1] = 0; }
                }
            }
        };

        // 3. Return result
        return trace;
    };

    var monthlySpentSpeedTrace = function( arr, monthIdString ){
        // 1. Setup
        var trace = { x: [], y: [], type: 'scatter' };

        // 2. Logic
        for( var i = 1; i <= MyDates.getDaysInSelectedMonth( monthIdString ); i++ ) {
            trace.x.push( i );
            trace.y[i-1] = arr[0]['monthlySpentSpeed'];
        };

        // 3. Return result
        return trace;
    };

    var volumesByCategoryTrace = function( arr, monthIdString ){
        // 1. Setup
        var trace = { labels: [], values: [], type: 'pie' };
        // 2. Logic
        //[{"_id":1,"categoryVolume":900},{"_id":2,"categoryVolume":90}]

        for( var i = 0; i < arr.length; i++ ){
            trace.labels[i] = arr[i]._id;
            trace.values[i] = arr[i].categoryVolume;
        }

        // 3. Return result
        return trace;
    };

    var expenseFrequencyTrace = function( arr, monthIdString ) {
        // 1. Setup
        var trace = { values: [], labels: [], type: 'pie' };
        // 2. Logic
        for( var i = 0; i < arr.length; i++ ){
            trace.labels[i] = arr[i]._id;
            trace.values[i] = arr[i].expenseFrequency;
        }

        // 3. Return result
        return trace;
    };

    // register Service in wagner
    wagner.factory( 'PlotlyTracer', function() { return s; } );
    // return Service.
    return s;
};