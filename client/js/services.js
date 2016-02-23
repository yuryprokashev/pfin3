var status = require( 'http-status' );

// TODO. Write code for $expenses service, that goes via RESTful API to server and performs CRUD operations with expenses
exports.$expenses = function( $http ) {

    var categories, currencies;

    // create empty service object
    var s = {};


    // service exposes the following API
    s.getExpenseListByUserPerMonth = function( user, month, year ) {
        var e = {};
        // TODO. Code should go to server via RESTful API and get all expenses for given user, given month and year
        return e;
    };

    s.deleteExpenseForUser = function ( expense, user ) {
        // TODO. Code should delete expense object for given user via RESTful API and return { status: true } if success
        return { status: true }

    };


    s.select = function ( type, id ) {
        var array;

        if( type === 'category' ){
            array = categories;
        }
        else if( type === 'currency' ){
            array = currencies;
        };

        selectItem( array, id );

        return array;
    };


    // returns service object with API
    return s;
};

// TODO. Write code for $charts service, that goes via RESTful API to server and gets charts data
exports.$charts = function( $http ) {

    // create empty service object
    var s = {};

    // service exposes the following API
    s.getChartForUserPerMonth = function( chartName, user, month, year ) {
        // TODO. Code should get chart data from server for given chart name, user, given month and year.
    };

    return s;
};

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

// Get moment.js package to deal with months easily

//var moment = require( 'moment' );

exports.$date = function () {

    var s = {};

    var d = new Date();

    s.selectedDate = new Date(d.getFullYear(), d.getMonth());

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