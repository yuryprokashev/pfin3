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
        link: function (scope, el, attrs ) {
            // SETUP
            var dailyVolumesDiv = el.find('daily-volumes')[0];
            var categoryVolumesDiv = el.find('category-volumes')[0];
            var expenseFrequencyDiv = el.find('expense-frequency')[0];

            // > helper function that call creation of all three charts
            var createAllCharts = function() {

                var charts = scope.charts.charts;
                var layouts = scope.charts.layouts;

                // Build empty charts for received charts
                for( var i in charts ) {

                    // > get chartDiv for trace
                    var chartDiv = charts[i].chartDiv;

                    // > get traces
                    var traces = charts[i].traces;

                    // > get trace layout from tracesMeta
                    var layout = layouts[chartDiv];

                    // > if both 'layout' and 'traces' are exists, create newPlot.
                    if(chartDiv && layout && traces) {
                        Plotly.newPlot( chartDiv, traces, layout);
                    }
                    else {
                        console.log('chartDiv, layout or default does not exists for ' + charts[i]);
                    }
                }
            };

            // > helper function that calls all three charts updates
            var redrawAllCharts = function() {
                scope.charts.renewTrace( 'dailyVolumes', function( data ) {
                    //console.log(dailyVolumesDiv.data);
                    dailyVolumesDiv.data = data.traces;
                    Plotly.redraw(dailyVolumesDiv);
                });

                scope.charts.renewTrace( 'categoryVolumes', function( data ) {
                    //console.log(categoryVolumesDiv.data);
                    categoryVolumesDiv.data = data.traces;
                    Plotly.redraw(categoryVolumesDiv);
                });

                scope.charts.renewTrace( 'expenseFrequency', function( data ) {
                    expenseFrequencyDiv.data = data.traces;
                    Plotly.redraw(expenseFrequencyDiv);
                });
            };

            // LOGIC
            // > when we load the page, and chart setup data is received, we re-draw charts
            scope.$on('SetupReady', function() {
                //console.log(el.find('daily-volumes'));
                //console.log(el.find('daily-volumes')[0].data[0]);
                createAllCharts();
                redrawAllCharts();

                // >> when we change month, we re-draw charts
                scope.$on('MonthChanged', function() {
                    redrawAllCharts();
                });

                // >> when user create Expense, we re-draw charts
                scope.$on('ExpenseCreated', function(){
                    redrawAllCharts();
                });

                // >> when user delete Expense, we re-draw charts.
                scope.$on('ExpenseDeleted', function() {
                    redrawAllCharts();
                });
            });


        }
    }

};