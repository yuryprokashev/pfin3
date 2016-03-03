var status = require( 'http-status' );

exports.$user = function( $http ) {
    var s = {};
    s.getUser = function() {
        $http.
        get('/api/v1/me').
        success( function( data ) {
            s.user = data.user;
        }).
        error( function( data, status ) {
            if( status === status.UNAUTHORIZED ) {
                s.user = null;
            }
        });
    };
    s.getUser();
    setInterval(s.getUser, 60 * 60 * 1000);
    return s;
};

exports.$date = function () {

    var s = {};

    //var d = new Date();

    //s.selectedDate = new Date(d.getFullYear(), d.getMonth());
    s.selectedDate = new Date();

    s.months = [];

    function createMonths ( origin ) {
        //console.log(origin);
        var result = [];
        // make a list of 11 months, with start month in the middle
        for( var i = -5 ; i <= 5; i++ ){
            var m = new Date(origin.getFullYear(), origin.getMonth());

            m.setMonth( origin.getMonth() + i );

            m.isSelected = false;
            result.push(m);
        }
        // make central month 'Selected'
        result[5].isSelected = true;
        return result;
    };

    s.months = createMonths( s.selectedDate );

    s.selectMonth = function( month ) {
        s.months = createMonths( month );
        s.selectedDate = s.months[5];
    };

    s.getDate = function () {
        return s.selectedDate;
    };

    s.setDate = function( date ) {
        s.selectedDate = date;
    };
    return s;
};

exports.$charts = function( $http, $date ) {
    var s = {};

    s.dailyVolumes = {};
    s.monthlySpentSpeed = {};
    s.volumesByCategory = {};
    s.frequencyByCategory = {};

    s.renewCharts = function ( callback ) {
        $http.get('/api/v1/charts/' + $date.getMonthId()).
        then( function successCallback( res ) {
            s.dailyVolumes = res.data['dailyVolumes'];
            s.monthlySpentSpeed = res.data['monthlySpentSpeed'];
            s.volumesByCategory = res.data['volumesByCategory'];
            s.frequencyByCategory = res.data['frequencyByCategory'];
            callback();
        }, function errorCallback( res ){
            console.log( res );
        });
    };

    return s;
};