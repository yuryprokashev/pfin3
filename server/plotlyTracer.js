module.exports = function( wagner ) {

    var s = {};

    // gets db query results in arr of { _id, traceName }
    // gets traceName as sting
    // gets type of chart as string to be used for plotly.js. E.g. 'bar', 'scatter'.
    // gets monthId as string
    // outputs arr into plotly trace of { x: [ _id1, _id2..], y: [value 1, value 2], type }
    s.makePlotlyTrace = function( traceName, arr, type, monthIdString ) {

        // 1. Setup
        var trace = { x: [], y: [], type: type };
        var MyDates = wagner.invoke( function(MyDates) { return MyDates } );

        // 2. Logic
        for( var i = 1; i <= MyDates.getDaysInSelectedMonth( monthIdString ); i++ ) {
            trace.x.push( i );
            for( var j in arr ){
                if( !trace.y[i] && arr[j]._id === i ) {
                    trace.y[i] = arr[j][traceName];
                }
                else if( !trace.y[i] && arr[j]._id !== i) {
                    trace.y[i] = 0;
                }
            }
        };

        // 3. Result
        return trace;
    };

    // register Service in wagner
    wagner.factory( 'PlotlyTracer', function() { return s; } );
    // return Service.
    return s;
};