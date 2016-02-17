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

exports.$date = function () {

    var s = {};

    s.selectedDate = new Date();
    // TODO. Code should return currently set month and year.
    s.getDate = function () {
        return s.selectedDate;
    };
    // TODO. Code should change currently set month and year
    s.setDate = function( date ) {
        s.selectedDate = date;
    };
    return s;
};