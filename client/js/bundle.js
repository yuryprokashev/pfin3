(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var controllers = require( './controllers.js' );
var directives = require( './directives.js' );
var services = require( './services.js' );
var _ = require( 'underscore' );

var components = angular.module( 'personalFinance.components', ['ng']);

_.each( controllers, function( controller, name ) {
    components.controller( name, controller );
});

_.each( directives, function( directive, name ) {
    components.directive( name, directive );
});

_.each( services, function( factory, name ) {
    components.factory( name, factory );
});

var client = angular.module( 'personalFinance', [ 'personalFinance.components', 'ngRoute']);

client.config( function( $routeProvider ){

    $routeProvider.
        when ('/', {
        templateUrl: 'assets/templates/main.html'
    }).
        when ('/dashboard', {
        templateUrl: 'assets/templates/expensesApp.html'
    }).
    when ('/list', {
        templateUrl: 'assets/templates/expensesCalendarApp.html'
    });

});
},{"./controllers.js":2,"./directives.js":3,"./services.js":4,"underscore":6}],2:[function(require,module,exports){
exports.ExpensesCalendarAppCtrl = function( $scope, $user, $date, $http ) {

    // MODEL
    var Expense = function(args) {
        if(!args.user) {
            console.error('Expense created with undefined user');
            console.log(args.user);
        }
        else {
            this.user = args.user;
        }

        this.date = args.date || $date.selectedDate;
        this.amount = args.amount;
        this.description = args.description;
        if(!args.labels) {
            this.labels = {isConfirmed: true, isDeleted: false, isDefault: false};
        }
        else {
            this.labels = args.labels;
        }
    };
    Expense.prototype = {

    };

    $scope.user = {};
    $scope.date = $date;
    $scope.cells = [];
    $scope.expenseList = [];
    $scope.newExpense = {};
    $scope.expenseFormPositions = [];
    $scope.selectedDay = {date: new Date()};
    
    // METHODS
    $scope.createNewExpenseObject = function(args){
        return new Expense(args);
    };

    $scope.selectMonth = function( event, month ) {
        event.target.blur();
        $scope.date.selectMonth( month );
    };

    $scope.resetNewExpenseForm = function () {
        $scope.user = $user.user;
        // console.log($scope.user);
        $scope.newExpense = $scope.createNewExpenseObject({
            user: $scope.user._id,
            date: null,
            amount: null,
            description: null,
            labels: null
        });
    };

    $scope.fillExpenseList = function (success) {

        var mId = $scope.date.getMonthId();

        $http.get( '/api/v1/expenses/' + mId).
        then(
            function successCallback (res) {
                $scope.expenseList = res.data;

                // addIsFormShownLabel();
                $scope.cells = $date.getCells();
                if(success) {
                    success();
                }
            },
            function errorCallback (res) {
                console.error(res);
            }
        );
    };
    $scope.resetExpenseList = function() {
        $scope.expenseList = [];
    };
    
    $scope.findExpenseFormPositionById = function(id) {
        var e = {};
        var positions = $scope.expenseFormPositions;
        var result = positions.find(function (item) {
            return item._id == id;
        });
        if (result) {
            // console.log(result);
            e = result.popup;
            return e;
        }
        if (!e) {
            console.log('No expenses found for id = ' + id);
            return null;
        }
    };

    $scope.findExpenseById = function(id) {
        var e = {};
        var days = $scope.expenseList;
        for( var i in days ){
            var result = days[i].expenses.find( function(item){
                return item._id == id;
            });
            if(result) {
                e = result;
                return e;
            }
        }
        if(!e) {
            console.log('No expenses found for id = ' + id);
        }
    };

    $scope.post = function( expense, callback ) {
        // console.log('posting expense');
        $http.post( '/api/v1/expenses', expense ).
        success( function( res ) {
            $scope.$emit('ExpenseCreated', {expense: res.expense});
            if(callback) {
                callback(res.expense);
            }
        }).
        error(function (res) {
            console.log( res );

        });
    };

    $scope.showForm = function (expense) {
        expense.labels.isFormShown = true;
    };
    
    $scope.selectDay = function( day ) {
        // console.log('selectDay start');

        $scope.$broadcast('DeselectAllDays');

        if(day) {
            $scope.selectedDay = day;
        }
        // console.log($scope.selectedDay);
        $scope.$broadcast('DaySelected', {day: $scope.selectedDay});

    };

    // EVENT LISTENERS
    $scope.$on('UserDefined', function () {
        $scope.resetNewExpenseForm();

    });
    $scope.$on('ExpenseCreated', function(event, args){
        // var expense = args.expense;
        // console.log(args.expense._id);
        $scope.resetExpenseList();
        $scope.fillExpenseList(function() {
            var e = $scope.findExpenseById(args.expense._id);
            // e.labels.isFormShown = true;
            $scope.$emit('ExpenseFormViewRequest', {expense: e});
        });
    });
    $scope.$on('ExpenseConfirmed', function () {
        $scope.resetExpenseList();
        $scope.fillExpenseList();
    });
    $scope.$on('ExpenseDeleted', function () {
        $scope.resetExpenseList();
        $scope.fillExpenseList();
    });

    $scope.$on('ExpenseFormViewRequest', function (event, args) {
        // console.log('expense form view request for id: ' + args.expense._id);
        $scope.showForm(args.expense);
    });

    $scope.$on('DaySelectionRequest', function (event, args) {
        // console.log('day selection request from expenseCalendar directive');
        $scope.selectDay(args.day);
    });

    // MAIN
    $user.getUser(function success () {
        $scope.$emit('UserDefined');
    });

};

exports.ExpenseInputFormCtrl = function ( $scope ) {

    $scope.$on('ExpenseCreated', function(){
        $scope.resetNewExpenseForm();
    });

};

exports.ExpensesCalendarCtrl = function( $scope, $http ) {

    // VIEW FUNCTIONS (FUNCTIONS THAT CALCULATE DATA FOR VIEW)
    $scope.getTotalPerDay = function( date ) {
        // console.log(date);
        if(!(date instanceof Date)) {
            // console.log("you passed input of wrong type. Please, pass 'Date' object.");
        }

        function isSameDate(value) {
            return Number(value._id) === Number(day);
        };

        if(!date) {
            return null;
        }
        else {
            var day = date.getDate();
            // console.log('day from data is ' + day);
            var result = $scope.expenseList.filter(isSameDate);
            if(!result.length) {
                return 0;
            }
            else {
                return result[0].dayTotal;
            }
        }
    };
    $scope.getExpensesForDate = function( date ) {

        function isSameDate(value) {
            return Number(value._id) === Number(day);
        };

        if(!date) {
            return null;
        }
        else {
            var day = date.getDate();
            var result = $scope.expenseList.filter(isSameDate);
            if(!result.length) {
                return 0;
            }
            else {
                // console.log(result[0].expenses);
                return result[0].expenses;
            }
        }
    };
    $scope.getRecommendationsCount = function( date ) {
        function isSameDate(value) {
            return Number(value._id) === Number(day);
        };

        if(!date) {
            return null;
        }
        else {
            var day = date.getDate();
            var result = $scope.expenseList.filter(isSameDate);
            if(!result.length) {
                return 0;
            }
            else {
                // console.log(result[0].expenses);
                return result[0].dayCount;
            }
        }
    };
    $scope.isWeekend = function(date) {
        if(date) {
            if(date.getDay() === 0 || date.getDay() === 6) {
                return true;
            }
            else {
                return false;
            }
        }
    };

    // SERVER REQUEST SENDERS
    $scope.confirmExpense = function ( obj ) {
        $http.post('/api/v1/recommend/expenses', obj).
        then(
            function( res ) {
                // console.log(res.data);
                $scope.$emit('ExpenseConfirmed', res.data._id);
            }
        )
    };
    $scope.deleteExpense = function( id ) {
        $http.delete('/api/v1/expenses/' + id).
        then(
            function successCallback(res) {
                $scope.$emit('ExpenseDeleted');
            },
            function errorCallback( res ) {
                console.error( res );
            }
        );
    };

    // UI EVENT EMITTERS
    $scope.emitExpenseCreateRequest = function (event, day) {
        $scope.$emit('ExpenseCreateRequest', {date: day.date});
    };

    // EVENT LISTENERS
    $scope.$watch( 'date', function (){
        $scope.fillExpenseList();
    }, true);
    $scope.$on('ExpenseCreateRequest', function(event, args){
        var e = $scope.createNewExpenseObject({
            user: $scope.user._id,
            date: args.date,
            amount: 0,
            description: 'New expense',
            labels: {isConfirmed: false, isDeleted:false, isDefault: false}
        });

        $scope.post(e);
    });
    $scope.$on('ExpenseConfirmRequest', function(event, args){
        // console.log('expense confirm request intercepted');
        $scope.confirmExpense(args.expense);
    });
    $scope.$on('ExpenseDeleteRequest', function(event, args){
        // console.log('expense delete request intercepted');
        $scope.deleteExpense(args._id);
    });
    // $scope.$on('ExpenseFormViewRequest', function (event, args) {
    //     console.log('expense form view request for id: ' + args.expense._id);
    //     $scope.showForm(args.expense);
    // });


};

exports.ExpensesDashboardCtrl = function( $scope, $charts, $date ) {

    $scope.charts = $charts;
    $scope.date = $date;
    
    var charts = $scope.charts.charts;
    var layouts = $scope.charts.layouts;

    // 1. SETUP STEP
    $scope.charts.getLayouts( function() {
        $scope.$emit('SetupReady');
    });

    $scope.$watch('date.selectedDate', function(){
        $scope.$emit('MonthChanged');
    });

    // 2. LOGIC. Chart creation and updates
    $scope.createChart = function ( chartName ) {

        var traces = charts.find( function( item ){
            return item.chartDiv === chartName;
        }).traces;

        var layout = layouts[ chartName ];

        if(chartName && layout && traces) {
            Plotly.newPlot( chartName, traces, layout);
        }
        else {
            console.log('chartDiv, layout or default does not exists for ' + charts[i]);
        }
    };
    
    $scope.redrawChart = function( chartName, element ) {
        $scope.charts.renewTrace( chartName, function( data ){
            element.data = data.traces;
            Plotly.redraw(element);
        });
    };
};

exports.RecommendedExpensesListCtrl = function( $scope, $date, $http, $error ) {

    $scope.recommendedExpenseList = [];

    $scope.date = $date;

    $scope.isLoading = false;

    $scope.error = { errorMsg: "", isError: false };

    $scope.resetRecommendedExpenseList = function() {
        $scope.recommendedExpenseList = [];
    };

    $scope.fillRecommendedExpenseList = function () {

        $scope.isLoading = true;

        $http.get( '/api/v1/recommend/expenses' ).
        then(
            function successCallback (res) {
                // console.log(res);
                if(res.data.recommendations.error) {
                    $scope.error.isError = true;
                    $scope.error.errorMsg = $error.translate(res.data.recommendations.error);
                    $scope.isLoading = false;
                }
                else {
                    $scope.recommendedExpenseList = res.data.recommendations;
                    $scope.isLoading = false;
                }
            },
            function errorCallback (res) {
                console.log(res);
            }
        );
    };

    $scope.confirm = function( id ) {
        console.log('this recommendation is confirmed: '+ id);
        var obj = $scope.recommendedExpenseList.find( function(item){
            return item._id === id;
        });

        $http.post( '/api/v1/recommend/expenses', obj ).
        success( function( res ) {
            $scope.$emit('RecommendedExpenseConfirmed');
            console.log(res);
        }).
        error(function (res) {
            console.log( res );
        });
    }
    $scope.delete = function( id ) {
        $http.delete('/api/v1/recommend/expenses/' + id).
        then(
            function successCallback(res) {
                $scope.$emit('RecommendedExpenseDeleted');
                var id = res.data._id;
                for(var i in $scope.recommendedExpenseList){
                    if($scope.recommendedExpenseList[i]._id === id) {
                        $scope.recommendedExpenseList.splice( i, 1 );
                        break;
                    }
                }
            },
            function errorCallback( res ) {
                console.error( res );
            }
        );
    };

    $scope.$watch( 'date', function () {
        $scope.resetRecommendedExpenseList();
        $scope.fillExpenseList();
    }, true);

    $scope.$on( "RecommendedExpenseConfirmed", function (){
        $scope.resetRecommendedExpenseList();
        $scope.fillRecommendedExpenseList();
    });

};

},{}],3:[function(require,module,exports){
exports.expenseInputForm = function() {

    return {
        controller: "ExpenseInputFormCtrl",
        templateUrl: '/assets/templates/expenseInputForm.html'
    }

};

exports.expensesCalendar = function() {

    return {
        controller: "ExpensesCalendarCtrl",
        templateUrl: '/assets/templates/expensesCalendar.html',
        link: function (scope, el, attrs, controllers) {
            // console.log('expensesCalendar directive');
            // console.log(scope);
            // console.log(el[0]);
            scope.emitDaySelectionRequest = function(day) {
                scope.$emit('DaySelectionRequest', {day: day});
            }

            // scope.emitDaySelectionRequest();
        }
    }

};

exports.expenseCalendarDay = function() {
    return {
        require: ["^?expensesCalendar"],
        scope: {
            day: "=extDay",
            getTotalPerDay: "&extGetTotalPerDay",
            getExpensesForDate: "&extGetExpensesForDate",
            getRecommendationsCount: "&extGetRecommendationsCount",
            isWeekend: "&extIsWeekend",
            selectedDay: "=extSelectedDay"
        },
        templateUrl: '/assets/templates/expenseCalendarDay.html',
        link: function ( scope, el, attrs, controllers ) {
            // 1. Day is not selected by default, unless it is equal to selected day.
            if(scope.day.date) {
                if(scope.selectedDay.date.getDate() === scope.day.date.getDate()) {
                    scope.isSelected = true;
                }
                else {
                    scope.isSelected = false;
                }
            }

            // 2. Listen to 'DaySelected' event
            scope.$on('DaySelected', function (event, args){
                // console.log('this is expenseCalendarDay directive - Day is Selected');
                if(scope.day.date) {
                    if(args.day.date.getDate() === scope.day.date.getDate()) {
                        scope.isSelected = true;
                    }
                    // console.log(args.day.date.getDate() === scope.day.date.getDate());
                }
            });

            // 3. Listen to 'DeselectAllDays' event
            scope.$on('DeselectAllDays', function () {
                scope.isSelected = false;
            });

            // console.log('calendar day created');
            // console.log('expenseCalendarDay directive');
            // console.log(scope);
            // console.log(el[0]);
            // console.log(scope);
        }
    }
};

exports.expenseCalendarDayItem = function() {
    return {
        require: ["^?expensesCalendar"],
        templateUrl: "/assets/templates/expenseCalendarDayItem.html",
        scope: {
            e: "=extE"
        },
        link: {
            post: function (scope, el, attrs, controllers) {
                // 1. Expense item HTML uses ng-style to position the expense pop-up form relative to the expense item ->
                // -> Calculate this position foe each expense item and store it in each item's scope.
                scope.popup = {
                    position: {
                        left: 0,
                        top: 0
                    }
                };
                var r = el[0].getBoundingClientRect();
                scope.popup.position.left = r.width + 14;
                scope.popup.position.top = -25;

                // 2. Expense item HTML uses 'emitExpenseFormViewRequest' function. -> Make it available in each item scope.
                scope.emitExpenseFormViewRequest = function( event, expense ) {
                    scope.$emit("ExpenseFormViewRequest", {expense: expense});
                };

                // 3. Expense popup form is hidden by default -> Make it hidden.
                if(!scope.e.labels.isFormShown) {
                    scope.e.labels.isFormShown = false;
                }
            }
        }
    }
};

exports.expenseCalendarDayItemForm = function() {
    return {
        require: ["^?expensesCalendar"],
        templateUrl: "/assets/templates/expenseCalendarDayItemForm.html",
        scope: {
            e: "=extE"
        },
        link: function (scope, el, attrs, controllers) {
            // 1. Expense pop-up HTML uses  'emitExpenseConfirmRequest' function. -> Make it available in each form scope.
            scope.emitExpenseConfirmRequest = function(expense) {
                scope.$emit('ExpenseConfirmRequest', {expense: expense});
            };
            // 2. Expense pop-up HTML uses 'emitExpenseDeleteRequest' function. -> Make it available in each form scope.
            scope.emitExpenseDeleteRequest = function ( id ) {
                scope.$emit('ExpenseDeleteRequest', {_id: id});
            };
        }
    }
};

exports.expenseCalendarSelectedDay = function() {
    return {
        require: ["^?expensesCalendar"],
        scope: {
            day: "=extDay",
            getTotalPerDay: "&extGetTotalPerDay",
            getExpensesForDate: "&extGetExpensesForDate",
            getRecommendationsCount: "&extGetRecommendationsCount",
            isWeekend: "&extIsWeekend"
        },
        templateUrl: '/assets/templates/expenseCalendarSelectedDay.html',
        link: function ( scope, el, attrs, controllers ) {

            // 1. Listen to 'DaySelected' event
            scope.$on('DaySelected', function (event, args){
                // console.log('this is expenseCalendarSelectedDay directive');
                // console.log(args);
            });
            // console.log('expenseCalendarDay directive');
            // console.log(scope);
            // console.log(el[0]);
            // console.log(scope);
        }
    }
};


exports.expensesDashboard = function() {

    return {
        controller: "ExpensesDashboardCtrl",
        templateUrl: '/assets/templates/expensesDashboard.html'
    }

};

exports.dailyVolumes = function() {
    return {
        require: "^expensesDashboard",
        template: '<div id = "dailyVolumes"></div>',
        link: function ( scope, el, attrs ) {

            var chartName = 'dailyVolumes';
            var chartDiv = el[0].children[0];
            
            scope.$on( 'SetupReady', function () {
                scope.createChart( chartName );
                scope.redrawChart( chartName, chartDiv );

                // >> when we change month, we re-draw charts
                scope.$on('MonthChanged', function() {
                    scope.redrawChart( chartName, chartDiv );
                });

                // >> when user create Expense, we re-draw charts
                scope.$on('ExpenseCreated', function(){
                    scope.redrawChart( chartName, chartDiv );
                });

                // >> when user delete Expense, we re-draw charts.
                scope.$on('ExpenseDeleted', function() {
                    scope.redrawChart( chartName, chartDiv );
                });
            });
        }
    }
};

exports.categoryVolumes = function() {
    return {
        require: "^expensesDashboard",
        template: '<div id = "categoryVolumes"></div>',
        link: function ( scope, el, attrs ) {
            var chartName = 'categoryVolumes';
            var chartDiv = el[0].children[0];

            scope.$on( 'SetupReady', function () {
                scope.createChart( chartName );
                scope.redrawChart( chartName, chartDiv );

                // >> when we change month, we re-draw charts
                scope.$on('MonthChanged', function() {
                    scope.redrawChart( chartName, chartDiv );
                });

                // >> when user create Expense, we re-draw charts
                scope.$on('ExpenseCreated', function(){
                    scope.redrawChart( chartName, chartDiv );
                });

                // >> when user delete Expense, we re-draw charts.
                scope.$on('ExpenseDeleted', function() {
                    scope.redrawChart( chartName, chartDiv );
                });
            });
        }
    }
};

exports.expenseFrequency = function() {
    return {
        require: "^expensesDashboard",
        template: '<div id = "expenseFrequency"></div>',
        link: function ( scope, el, attrs, controllers ) {
            var chartName = 'expenseFrequency';
            var chartDiv = el[0].children[0];

            scope.$on( 'SetupReady', function () {
                scope.createChart( chartName );
                scope.redrawChart( chartName, chartDiv );

                // >> when we change month, we re-draw charts
                scope.$on('MonthChanged', function() {
                    scope.redrawChart( chartName, chartDiv );
                });

                // >> when user create Expense, we re-draw charts
                scope.$on('ExpenseCreated', function(){
                    scope.redrawChart( chartName, chartDiv );
                });

                // >> when user delete Expense, we re-draw charts.
                scope.$on('ExpenseDeleted', function() {
                    scope.redrawChart( chartName, chartDiv );
                });
                console.log(controllers);
            });
        }
    }
};

exports.notLoggedIn = function() {
    return {
        require: ["^ExpensesCalendarAppCtrl"],
        templateUrl: "/assets/templates/notLoggedIn.html"
    }
};

exports.monthSelector = function() {
    return {
        require: ["^ExpensesCalendarAppCtrl"],
        templateUrl: "/assets/templates/monthSelector.html"
    }
};

exports.recommendedExpensesList = function() {
    return {
        require: ["^ExpensesCalendarAppCtrl"],
        controller: "RecommendedExpensesListCtrl",
        templateUrl: "/assets/templates/recommendedExpensesList.html"
    }
};



},{}],4:[function(require,module,exports){
var status = require( 'http-status' );

exports.$user = function( $http ) {
    var s = {user:{}};
    s.getUser = function(callback) {
        $http.
        get('/api/v1/me').
        success( function( data ) {
            s.user = data.user;
            callback();
            // console.log(s.user);
        }).
        error( function( data, status ) {
            if( status === status.UNAUTHORIZED ) {
                s.user = null;
            }
        });
    };
    // s.getUser();
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
        // console.log(s.getDayOfWeekOfFirstDayInMonth());
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
    };

    s.getCells = function() {

        var createDates = function(dates) {
            // outputs the array of dates for each day in currently selected month
            for(var i = 1; i <= s.daysInMonth(s.getMonthId()); i++) {
                var dUTCSec = Date.UTC(s.selectedDate.getFullYear(), s.selectedDate.getMonth(), i);
                var dUTCDate = new Date(dUTCSec);
                dates.push(dUTCDate);
            }
            // console.log(dates);
            return dates;
        };

        var appendNullsBeforeAndAfter = function(dates) {
            // we need to fit the dates to 5x7 visual grid of calendar days.
            // it means, week starts at Sunday, but 1st day of the month is Saturday ->
            // we need to put empty days before 1st day of the month end empty days after last day of the month ->
            // so we put nulls before and after in our 'dates' array.
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
            // since the bootstrap grid, we created for calendar has 9 cells per calendar row, when we need only 7 ->
            // we need to put null before and null after each row

            // console.log(dates.length);
            var rows = 0;
            if(dates.length/7 > 5) {
                rows = 6;
            }
            else {
                rows = 5;
            };
            for(var i = 1; i < rows; i++){
                dates.splice(i*7 + 2*(i-1), 0, null, null);
            }
            dates.splice(0,0,null);
            dates.splice(dates.length, 0, null);
            return dates;
        };

        var putDatesToCells = function (dates) {
            var cells = [];

            var cellBlocks = 0;
            if(dates.length/7 > 5) {
                cellBlocks = 18;
            }
            else {
                cellBlocks = 15;
            };

            for(var i = 1; i <= cellBlocks; i++){
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
},{"http-status":5}],5:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
module.exports = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range not Satisfiable',
  417: 'Expectation Failed',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Time-out',
  505: 'HTTP Version not Supported',
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505
};

},{}],6:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[1]);
