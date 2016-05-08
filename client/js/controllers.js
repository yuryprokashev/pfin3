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
