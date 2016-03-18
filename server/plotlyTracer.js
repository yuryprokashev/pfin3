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
        var inputTraces = Config.getChartTraces( chartName );

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
    var dailyVolumesTrace = function( inputTrace, arr, monthIdString ) {
        // 1. Setup
        inputTrace.x = [];
        inputTrace.y = [];

        // 2. Logic
        for( var i = 1; i <= MyDates.getDaysInSelectedMonth( monthIdString ); i++ ) {
            inputTrace.x.push( i );

            if(!inputTrace.y[i-1]) {
                for( var j in arr ) {
                    if( arr[j]._id === i){ inputTrace.y[i-1] = arr[j]['dailyVolumes']; break; }
                    else { inputTrace.y[i-1] = 0; }
                }
            }
        };

        // 3. Return result
        return trace;
    };

    var monthlySpentSpeedTrace = function( inputTrace, arr, monthIdString ){
        // 1. Setup
        inputTrace.x = [];
        inputTrace.y = [];

        //console.log(arr);

        // 2. Logic
        for( var i = 1; i <= MyDates.getDaysInSelectedMonth( monthIdString ); i++ ) {
            inputTrace.x.push( i );
            inputTrace.y[i-1] = arr[0]['monthlySpentSpeed'];
        };

        // 3. Return result
        return inputTrace;
        // myEmitter.emit('dailyVolumesPlotlyTraceReady', inputTrace);
    };

    var volumesByCategoryTrace = function( inputTrace, arr, monthIdString ){
        // 1. Setup
        inputTrace.labels = [];
        inputTrace.values = [];

        // 2. Logic
        //[{"_id":1,"categoryVolume":900},{"_id":2,"categoryVolume":90}]

        for( var i = 0; i < arr.length; i++ ) {

            //console.log(arr);
            inputTrace.labels[i] = arr[i]._id;
            //console.log(inputTrace.labels[i]);
            inputTrace.values[i] = arr[i].categoryVolume;
        }

        //console.log(inputTrace);

        // 3. Return result
        return inputTrace;
    };

    var expenseFrequencyTrace = function( inputTrace, arr, monthIdString ) {
        // 1. Setup
        inputTrace.x = [];
        inputTrace.y = [];
        // 2. Logic
        for( var i = 0; i < arr.length; i++ ){
            inputTrace.x[i] = arr[i]._id;
            inputTrace.y[i] = arr[i].expenseFrequency;
        }

        // 3. Return result
        return inputTrace;
        // myEmitter.emit('expenseFrequencyPlotlyTraceReady', inputTrace);
    };

    // register Service in wagner
    wagner.factory( 'PlotlyTracer', function() { return s; } );
    // return Service.
    return s;
};