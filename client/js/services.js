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

    s.getMonthId = function () {
        var result =  undefined;

        var year = this.selectedDate.getFullYear();
        var month = this.selectedDate.getMonth();

        result = year.toString() + month.toString();

        return result;
    };

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

    var s = {charts:[],layouts:[], isRequestInProgress: false};

    s.getLayouts = function( callback ) {
        s.isRequestInProgress = true;
        $http.get( '/api/v1/charts/meta' ).
        then(
            function successCallback( res ){
                for( var i in res.data ) {
                    s.charts[ i ] = { chartDiv: res.data[i].chartDiv, traces: res.data[i].traces };
                    s.layouts[ res.data[i].chartDiv ] = res.data[i].layout;
                }
                //console.log(res.data);
                //console.log(s.layouts);
                //console.log(s.charts);
                callback();
                s.isRequestInProgress = false;
            },
            function errorCallBack( res ){
            console.error('error in $charts.charts');
            console.log(res);
            }
        );
    };

    s.reset = function() {
        s.charts = [];
    };

    s.renewTrace = function( traceName, callback ) {
        s.isRequestInProgress = true;
        $http.get( '/api/v1/charts/' + traceName + '/'+ $date.getMonthId()).
            then( function successCallback (res) {

            //console.log(res.data);
            //s.charts.push(res.data);
            callback( res.data );
            s.isRequestInProgress = false;
        }, function errorCallback (res) {
            console.error('error in $charts.renewTrace');
            console.log(res);
        });
    };

    return s;
};