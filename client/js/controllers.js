exports.mainCtrl = function( $scope, $user, $date ) {
    $scope.user = $user;
    $scope.date = $date;
    $scope.selectMonth = function( event, month ) {
        event.target.blur();
        $scope.date.selectMonth( month );
    };

};

exports.ExpenseInputFormCtrl = function ( $scope, $user, $date, $http ) {

    $scope.selectItem = function( array, id, item ) {
        $scope.obj[item] = id;
        for( var i in array ) {
            if( array[ i ]._id === id ) {
                array[ i ].isSelected = true;
            }
            else {
                array[ i ].isSelected = false;
            }
        }
    };

    $scope.reset = function () {
        $scope.obj = {
            date: $date.selectedDate,
            // category: 1,
            // currency: 1,
            amount: undefined,
            description: ''
        };
    };

    $scope.reset();

    $scope.currencies = undefined;
    $scope.categories = undefined;

    // Code should get categories array from the server via RESTful API
    // $http.get( '/api/v1/common/categories' ).
    // then( function (res) {
    //     $scope.categories = res.data.categories;
    //     $scope.selectItem( $scope.categories, $scope.categories[0]._id, $scope.obj.category );
    //     $scope.obj.category = $scope.categories[0]._id;
    // }, function (res) {
    //     console.log('server error');
    //     console.log(res);
    // });

    // $http.get( '/api/v1/common/currencies' ).
    // then( function (res) {
    //     $scope.currencies = res.data.currencies;
    //     $scope.selectItem( $scope.currencies, $scope.currencies[0]._id, $scope.obj.currency );
    //     $scope.obj.currency = $scope.currencies[0]._id;
    // }, function (res) {
    //     console.log('server error');
    //     console.log(res);
    // });

    $scope.post = function() {
        $scope.obj.user = $user.user._id;
        //console.log($scope.obj);
        $http.post( '/api/v1/expenses', $scope.obj ).
        success( function( res ) {
            $scope.$emit('ExpenseCreated');
            $scope.reset();
        }).
        error(function (res) {
            console.log( res );

        });
    };

    setTimeout( function() {
        $scope.$emit('ExpenseInputFormCtrl');
    }, 0);
};

exports.ExpenseListCtrl = function( $scope, $date, $http ) {

    $scope.expenseList = [];

    $scope.date = $date;

    $scope.reset = function() {
        $scope.expenseList = [];
    };

    $scope.getTotalPerDay = function( date ) {

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

    $scope.fillExpenseList = function () {

        var mId = $scope.date.getMonthId();

        $http.get( '/api/v1/expenses/' + mId).
        then(
            function successCallback (res) {
                $scope.expenseList = res.data;
                $scope.cells = $date.getCells();
            },
            function errorCallback (res) {
                console.error(res);
            }
        );
    };

    $scope.delete = function( id ) {
        $http.delete('/api/v1/expenses/' + id).
            then(
            function successCallback(res) {
                $scope.$emit('ExpenseDeleted');
                // var id = res.data._id;
                // for(var i in $scope.expenseList){
                //     if($scope.expenseList[i]._id === id) {
                //         $scope.expenseList.splice( i, 1 );
                //         break;
                //     }
                // }
            },
            function errorCallback( res ) {
                console.error( res );
            }
        );
    };

    $scope.reject = function( id ) {
        $http.delete('/api/v1/recommend/expenses/' + id).
            then(
            function (res) {
                console.log(res.data);
                $scope.$emit('ExpenseRejected', res.data._id);

            }
        )
    };

    $scope.confirm = function ( obj ) {
        $http.post('/api/v1/recommend/expenses', obj).
            then(
            function( res ) {
                console.log(res.data);
                $scope.$emit('ExpenseConfirmed', res.data._id);
            }
        )
    }

    $scope.$watch( 'date', function (){
        $scope.fillExpenseList();
    }, true);

    $scope.$on('ExpenseCreated', function(){
        $scope.reset();
        $scope.fillExpenseList();
    });
    $scope.$on('ExpenseConfirmed', function () {
        $scope.reset();
        $scope.fillExpenseList();
    });
    $scope.$on('ExpenseRejected', function () {
        $scope.reset();
        $scope.fillExpenseList();
    });
    $scope.$on('ExpenseDeleted', function () {
        $scope.reset();
        $scope.fillExpenseList();
    });


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

exports.RecommendedExpenseListCtrl = function( $scope, $date, $http, $error ) {

    $scope.recommendedExpenseList = [];
    $scope.date = $date;
    $scope.isLoading = false;
    $scope.error = { errorMsg: "", isError: false };

    $scope.reset = function() {
        $scope.recommendedExpenseList = [];
    };

    $scope.fillExpenseList = function () {

        $scope.isLoading = true;

        $http.get( '/api/v1/recommend/expenses' ).
        then(
            function successCallback (res) {
                console.log(res);
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
        $scope.fillExpenseList();
    }, true);

    $scope.$on( "RecommendedExpenseConfirmed", function (){
        $scope.fillExpenseList();
    })

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

};
