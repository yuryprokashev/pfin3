// TODO. Write code for all controllers

exports.mainCtrl = function( $scope, $user, $date ) {
    $scope.user = $user;
    $scope.date = $date;
    $scope.selectMonth = function( event, month ) {
        event.target.blur();
        $scope.date.selectMonth( month );
    };

};

exports.ExpenseInputFormCtrl = function ( $scope, $expenses, $user, $date, $http ) {

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
            category: 1,
            currency: 1,
            amount: undefined,
            description: ''
        };
    };

    $scope.reset();

    $scope.currencies = undefined;
    $scope.categories = undefined;

    // Code should get categories array from the server via RESTful API
    $http.get( '/api/v1/common/categories' ).
    then( function (res) {
        $scope.categories = res.data.categories;
        $scope.selectItem( $scope.categories, $scope.categories[0]._id, $scope.obj.category );
        $scope.obj.category = $scope.categories[0]._id;
    }, function (res) {
        console.log('server error');
        console.log(res);
    });

    $http.get( '/api/v1/common/currencies' ).
    then( function (res) {
        $scope.currencies = res.data.currencies;
        $scope.selectItem( $scope.currencies, $scope.currencies[0]._id, $scope.obj.currency );
        $scope.obj.currency = $scope.currencies[0]._id;
    }, function (res) {
        console.log('server error');
        console.log(res);
    });

    $scope.post = function() {
        $scope.obj.user = $user.user._id;
        //console.log($scope.obj);
        $http.post( '/api/v1/expenses', $scope.obj ).
        success( function( res ) {
            $scope.expenseList.push(res.expense);
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

exports.ExpenseListCtrl = function( $scope, $expenses, $date, $http ) {

    $scope.expenseList = [];
    $scope.date = $date;

    $scope.reset = function() {
        $scope.expenseList = [];
    };

    $scope.fillExpenseList = function () {
        var year = $scope.date.selectedDate.getFullYear();
        var month = $scope.date.selectedDate.getMonth();

        $http.get( 'api/v1/expenses/' + year + month).
        then(
            function successCallback (res) {
                $scope.expenseList = res.data;
                //console.log($scope.expenseList);
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
                var id = res.data._id;
                for(var i in $scope.expenseList){
                    if($scope.expenseList[i]._id === id) {
                        $scope.expenseList.splice( i, 1 );
                        break;
                    }
                }
            },
            function errorCallback( res ) {
                console.error( res );
            }
        );
    };

    $scope.$watch( 'date', function (newVal, oldVal ){
        //console.log(oldVal);
        //console.log(newVal);
        $scope.reset();
        $scope.fillExpenseList();
    }, true);

    $scope.fillExpenseList();

};


exports.ChartsViewCtrl = function ( $scope, $charts, $date, $user ) {

    $scope.date = {};

    $scope.$watch( 'date', function () {
        $scope.chart1 = $charts.getChartForUserPerMonth('chart1', $user.user, $scope.date.month, $scope.date.year );
        $scope.chart2 = $charts.getChartForUserPerMonth('chart2', $user.user, $scope.date.month, $scope.date.year );
        $scope.chart3 = $charts.getChartForUserPerMonth('chart3', $user.user, $scope.date.month, $scope.date.year );
        $scope.chart4 = $charts.getChartForUserPerMonth('chart4', $user.user, $scope.date.month, $scope.date.year );
    });

    // TODO. Get 4 charts to the scope from $charts service
    $scope.date = $date.selectedDate;

};

exports.DateSelectorCtrl = function ( $scope, $date ) {

    $scope.selection = $date.getDate();

    $scope.changeDate = function( date ) {
        $date.setDate( date );
    };

};
