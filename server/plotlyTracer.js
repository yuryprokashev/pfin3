module.exports = function( wagner ) {

    var s = {};
    var MyDates = wagner.invoke( function( MyDates ) { return MyDates } );
    var Config = wagner.invoke( function( Config ) { return Config } );
    // gets db query results in arr of { _id, traceName }
    // gets chartName as sting
    // gets monthId as string
    // outputs arr into plotly trace of { x: [ _id1, _id2..], y: [value 1, value 2], type }
    s.makePlotlyTrace = function( chartName, arr, monthIdString, callback ) {
        // 1. Setup
        var trace = {};
        var inputTraces = Config.getChartTraces( chartName );

        // 2. Logic
        // > daily Volumes CHART - 2 TRACES
        if( chartName === 'dailyVolumes' ) {
            if (arr[0].dailyVolumes){
                trace = dailyVolumesTrace( inputTraces[0], arr, monthIdString );
            }
            else if (arr[0].monthlySpentSpeed) {
                trace = monthlySpentSpeedTrace( inputTraces[1], arr, monthIdString );
            }
            else {
                console.log('Wrong traceName in arr ' + arr[0].toString());
            }
        }

        // > categoryVolumes CHART - 1 TRACE
        else if ( chartName === 'categoryVolumes' ) {
            if (arr[0].categoryVolume){
                trace = volumesByCategoryTrace( inputTraces[0], arr, monthIdString );
            }
            else {
                console.log('Wrong traceName in arr ' + arr[0].toString());
            }
        }

        // > expenseFrequency CHART - 1 TRACE
        else if (chartName === 'expenseFrequency' ) {
            if (arr[0].expenseFrequency) {
                trace = expenseFrequencyTrace( inputTraces[0], arr, monthIdString );
            }
            else {
                console.log('Wrong traceName in arr ' + arr[0].toString());
            }
        }

        else {
            console.log('invalid chartName or traceName: ' + chartName + '-' + arr.toString());
        }

        // 3. Result
        callback( trace );
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
        return inputTrace;
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
    };

    var volumesByCategoryTrace = function( inputTrace, arr, monthIdString ){
        // 1. Setup
        inputTrace.labels = [];
        inputTrace.values = [];
        inputTrace.marker.colors = [];

        // 2. Logic
        for( var i = 0; i < arr.length; i++ ) {

            //console.log(arr);
            inputTrace.labels[i] = arr[i]._id;
            //console.log(inputTrace.labels[i]);
            inputTrace.values[i] = arr[i].categoryVolume;
            inputTrace.marker.colors[i] = arr[i].categoryColor;
        }

        // 3. Return result
        return inputTrace;
    };

    var expenseFrequencyTrace = function( inputTrace, arr, monthIdString ) {
        // 1. Setup
        inputTrace.x = [];
        inputTrace.y = [];
        // 2. Logic
        for( var i = 0; i < arr.length; i++ ){
            inputTrace.x[i] = arr[i].expenseFrequency;
            inputTrace.y[i] = arr[i]._id;
        }

        // 3. Return result
        return inputTrace;
    };

    // register Service in wagner
    wagner.factory( 'PlotlyTracer', function() { return s; } );
    // return Service.
    return s;
};