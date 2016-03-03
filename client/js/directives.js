exports.expenseInputForm = function () {

    return {
        controller: 'ExpenseInputFormCtrl',
        templateUrl: '/assets/templates/expenseInputForm.html'
    }

};

exports.expenseList = function () {

    return {
        controller: 'ExpenseListCtrl',
        templateUrl: '/assets/templates/expenseList.html'
    }

};

exports.expensesDashboard = function () {

    return {
        controller: 'ExpensesDashboardCtrl',
        templateUrl: '/assets/templates/expensesDashboard.html',
        link: function(scope, element, attrs ) {
            var c = scope.charts;
            c.renewCharts( scope.plotCharts );
        }
    }

};