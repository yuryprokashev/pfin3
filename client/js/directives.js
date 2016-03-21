exports.expenseInputForm = function() {

    return {
        controller: 'ExpenseInputFormCtrl',
        templateUrl: '/assets/templates/expenseInputForm.html'
    }

};

exports.expenseList = function() {

    return {
        controller: 'ExpenseListCtrl',
        templateUrl: '/assets/templates/expenseList.html'
    }

};

exports.expensesDashboard = function() {

    return {
        controller: 'ExpensesDashboardCtrl',
        templateUrl: '/assets/templates/expensesDashboard.html'
    }

};

exports.dailyVolumes = function() {
    return {
        require: "^?ExpensesDashboardCtrl",
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
        require: "^?ExpensesDashboardCtrl",
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
        require: "^?ExpensesDashboardCtrl",
        template: '<div id = "expenseFrequency"></div>',
        link: function ( scope, el, attrs ) {
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
            });
        }
    }
};
