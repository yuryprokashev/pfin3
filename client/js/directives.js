exports.notLoggedIn = function() {
    return {
        // require: ["ExpensesCalendarAppCtrl"],
        templateUrl: "/assets/templates/notLoggedIn.html"
    }
};

exports.monthSelector = function() {
    return {
        templateUrl: "/assets/templates/monthSelector.html",
        link: function (scope, el, attrs, controllers) {
            scope.emitMonthSelectionRequest = function(event, month) {
                event.target.blur();
                scope.$emit("MonthSelectionRequest", {month: month});
            }
        }
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
            };
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

            scope.$watch('day.date', function(newV, oldV){
                if(scope.day.date) {
                    if(scope.selectedDay.date.getDate() === scope.day.date.getDate()) {
                        scope.isSelected = true;
                    }
                    else {
                        scope.isSelected = false;
                    }
                }
            });

            // 2. Listen to 'DaySelected' event
            scope.$on('DaySelected', function (event, args) {
                if(scope.day.date) {
                    if(args.day.date.getDate() === scope.day.date.getDate()) {
                        scope.isSelected = true;
                        console.log('day is selected');
                    }
                }
            });

            // 3. Listen to 'DeselectAllDays' event
            scope.$on('DeselectAllDays', function () {
                scope.isSelected = false;
            });
        }
    }
};

exports.expenseCalendarDayItem = function() {
    return {
        require: ["^?expensesCalendar"],
        templateUrl: "/assets/templates/expenseCalendarDayItem.html",
        scope: {
            e: "=extE",
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
                    scope.$emit("ExpenseFormViewRequest", {expense: expense, emitter: '<expense-calendar-day-item>'});
                };

                // 3. Expense popup form is hidden by default -> Make it hidden.
                if(!scope.e.labels.isCalendarDayFormShown) {
                    scope.e.labels.isCalendarDayFormShown = false;
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

exports.expenseCalendarSelectedDay = function($window) {
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
        link: {
            post: function ( scope, el, attrs, controllers ) {

                // 1. Listen to 'DaySelected' event
                scope.$on('DaySelected', function (event, args){
                    // console.log('this is expenseCalendarSelectedDay directive');
                    // console.log(args);
                });

                // 2. Expense item HTML uses 'emitExpenseFormViewRequest' function. -> Make it available in each item scope.
                scope.emitExpenseFormViewRequest = function( event, expense ) {
                    scope.$emit("ExpenseFormViewRequest", {expense: expense});
                };

                // 3. Save it's own position
                scope.position = {
                    left: 0,
                    top: 0
                };

                var r = el[0].getBoundingClientRect();
                console.log(r);
                scope.position.left = 0;
                scope.position.top = 0;

                var zero = {
                    left: r.left,
                    top: r.top
                }

                // 4. on 'scroll' event make it change the position
                angular.element($window).bind('wheel', function(event) {
                    console.log(event);
                    if(event.deltaY < 0) {
                        scope.$emit('SelectedDayScrolledUp', {newTop: $window.scrollY});
                    }
                    else if (event.deltaY > 0 ) {
                        scope.$emit('SelectedDayScrolledDown', {newTop: $window.scrollY});
                    }
                });

                scope.$on('SelectedDayScrolledUp', function( event, args ){
                    // console.log(args);
                    if(args.newTop - zero.top > 0) {
                        scope.position.top = args.newTop - zero.top;
                        scope.$apply();
                    }
                });

                scope.$on('SelectedDayScrolledDown', function( event, args ){
                    if(zero.top - args.newTop < 0) {
                        scope.position.top = args.newTop - zero.top;
                        scope.$apply();
                    }
                    // console.log(args);
                    // scope.position.top = args.newTop;
                    // scope.$apply();
                });

            }
        }
    }
};

exports.expenseCalendarSelectedDayItem = function() {
    return {
        require: ["^?expensesCalendar"],
        templateUrl: "/assets/templates/expenseCalendarSelectedDayItem.html",
        scope: {
            e: "=extE",
        },
        link: {
            post: function (scope, el, attrs, controllers) {
                // 1. Expense item HTML uses ng-style to position the expense pop-up form relative to the expense item ->
                // -> Calculate this position foe each expense item and store it in each item's scope.
                // scope.popup = {
                //     position: {
                //         left: 0,
                //         top: 0
                //     }
                // };
                // var r = el[0].getBoundingClientRect();
                // scope.popup.position.left = r.width + 14;
                // scope.popup.position.top = -25;

                // 2. Expense item HTML uses 'emitExpenseFormViewRequest' function. -> Make it available in each item scope.
                scope.emitExpenseFormViewRequest = function( event, expense ) {
                    scope.$emit("ExpenseFormViewRequest", {expense: expense, emitter: '<expense-calendar-selected-day-item>'});
                };

                // 3. Expense popup form is hidden by default -> Make it hidden.
                if(!scope.e.labels.isSelectedDayFormShown) {
                    scope.e.labels.isSelectedDayFormShown = false;
                }
            }
        }
    }
};

exports.expenseCalendarSelectedDayItemForm = function() {
    return {
        require: ["^?expensesCalendar"],
        templateUrl: "/assets/templates/expenseCalendarSelectedDayItemForm.html",
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

exports.recommendedExpensesList = function() {
    return {
        // require: ["ExpensesCalendarAppCtrl"],
        controller: "RecommendedExpensesListCtrl",
        templateUrl: "/assets/templates/recommendedExpensesList.html"
    }
};
