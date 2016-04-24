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

        var year = this.selectedDate.getFullYear();
        var month = this.selectedDate.getMonth();

        var result = year.toString() + month.toString();

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
        console.log(s.getDayOfWeekOfFirstDayInMonth());
    };

    s.getDate = function () {
        return s.selectedDate;
    };

    s.setDate = function( date ) {
        s.selectedDate = date;
    };

    s.getDayOfWeekOfFirstDayInMonth = function(){
        var firstDay = new Date(s.selectedDate);
        firstDay.setDate(1);
        return firstDay.getDay();
    };

    s.getFirstDayPosition = function() {
        var result = { cell:0, index: 0 };
        var start = s.getDayOfWeekOfFirstDayInMonth();
        if(start <= 1) {
            result.cell = 1;
            if(start === 0) {
                result.index = 1;
            }
            else if(start === 1) {
                result.index = 2;
            }
        }
        else if( start <= 4) {
            result.cell = 2;
            if(start === 2) {
                result.index = 0;
            }
            else if(start === 3) {
                result.index = 1;
            }
            else if(start === 4) {
                result.index = 2;
            }
        }
        else if( start <= 6) {
            result.cell = 3;
            if(start === 5) {
                result.index = 0;
            }
            else if(start === 6) {
                result.index = 1;
            }
        }
        return result;
    };

    // var cells = [
    //     { id: 1, cell: [ {date: null}, {date: new Date("2016-04-01")}, {date: new Date("2016-04-02")} ] },
    //     { id: 2, cell: [ {date: new Date("2016-04-03")}, {date: new Date("2016-04-04")}, {date: new Date("2016-04-05")} ] },
    //     { id: 3, cell: [ {date: new Date("2016-04-06")}, {date: new Date("2016-04-07")}, {date: null} ] },
    //     { id: 4, cell: [ {date: null}, {date: new Date("2016-04-08")}, {date: new Date("2016-04-09")} ] },
    //     { id: 5, cell: [ {date: new Date("2016-04-10")}, {date: new Date("2016-04-11")}, {date: new Date("2016-04-12")} ] },
    //     { id: 6, cell: [ {date: new Date("2016-04-13")}, {date: new Date("2016-04-14")}, {date: null} ] },
    // ];

    s.getMonth = function( monthIdString ) {
        return monthIdString.length === 6 ? Number(monthIdString.substring(4,6)) : Number(monthIdString.substring(4,5));
    };

    s.getYear = function( monthIdString ) {
        return Number(monthIdString.substring(0, 4));
    };

    s.daysInMonth = function( monthIdString ) {
        // gets 'month' as string, e.g. '20161'
        // returns number of calendar days in this month. Takes leap year into account.
        // 1. Setup.
        var number = 30;
        var month = s.getMonth( monthIdString );
        var year = s.getYear(monthIdString);

        // 2. Logic.
        if (month % 2 === 0 || month === 0) {
            number = 31;
        }
        else if (month === 1) {
            if (year % 4 === 0){
                number = 29;
            }
            else {
                number = 28;
            }
        }
        else if (month % 2 === 1 && month !== 1){
            number = 30;
        }
        // 3. Return result.
        return number;
    };

    var Cell = function(id, array){
        this.id = id;
        this.cell = array;
    };

    Cell.prototype = {

    };

    var Day = function(date) {
        this.date = date;
    }

    s.getCells = function() {

        var createDates = function(dates) {
            for(var i = 1; i <= s.daysInMonth(s.getMonthId()); i++) {
                dates.push(new Date(s.selectedDate.getFullYear(), s.selectedDate.getMonth(), i));
            }
            return dates;
        };

        var appendNullsBeforeAndAfter = function(dates) {
            var nullsBeforeNumber = dates[0].getDay();
            for (var i = 0; i < nullsBeforeNumber; i++){
                dates.splice(0,0, null);
            }

            var nullsAfterNumber = 5*7 - dates.length;

            for (var i = 0; i < nullsAfterNumber; i++) {
                dates.splice(dates.length, 0, null);
            }
            return dates;
        };

        var splitToRowsAndAppendNullsForEachRow = function(dates) {
            for(var i = 1; i <= 4; i++){
                dates.splice(i*7 + 2*(i-1), 0, null, null);
            }
            dates.splice(0,0,null);
            dates.splice(dates.length, 0, null);
            return dates;
        };

        var putDatesToCells = function (dates) {
            var cells = [];
            for(var i = 1; i <= 15; i++){
                var cell = new Cell(i,[]);
                for(var j = 1; j <= 3; j++) {
                    var day = new Day(null);
                    cell.cell.push(day);
                }
                cells.push(cell);
            }
            // console.log(cells);
            for(var n in cells) {
                for (var d in cells[n].cell) {
                    // console.log(cells[n].cell[d]);
                    var index = 3 * (cells[n].id - 1) + Number(d);
                    // console.log(index);
                    // console.log(dates[index]);
                    // console.log(cells[n].cell[d].date);
                    cells[n].cell[d].date = dates[index];
                    // console.log(cells[n].cell[d].date);
                    // console.log('---------------------');
                }
            }
            return cells;
            // console.log(cells);
        };

        var createDatesForBootstrapGrid = function () {
            var dates = [];
            createDates(dates);
            appendNullsBeforeAndAfter(dates);
            splitToRowsAndAppendNullsForEachRow(dates);
            // console.log(dates);
            // console.log(dates.length);
            var result = putDatesToCells(dates);
            // console.log(cells);
            return result;
        };

        var result = createDatesForBootstrapGrid();

        return result;
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

exports.$error = function() {
    var s = {};
    var errorReference = {
        EHOSTUNREACH: "Service in unreachable for the moment. We know about the problem and will fix it soon.",
        ECONNREFUSED: "Service does not accept connections now. We know about the problem and will fix it soon."
    }

    s.translate = function(errorCode) {
        var result = errorReference[errorCode];
        if(!result){
            console.log(errorCode);
            return "Unknown error. We know about the problem and will fix it soon."
        }
        else {
            return result;
        }
    }
    return s;
};