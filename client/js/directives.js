//pf.directive('submitBtn', [ 'channels', function( channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/common/submitBtn.html",
//        replace: false,
//        scope: {
//            objectToPost: "=",
//            channelGroup: "="
//        },
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
//            el.on('click', function() {
//                channels.publish( scope.channelGroup.save, scope.objectToPost);
//            });
//        }
//    }
//}]);
//
//pf.directive('multipleBtnsSelect', [ 'channels', function( channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/common/multipleBtnsSelect.html",
//        replace: true,
//        controller: ['$scope', '$log', function ( $scope, $log ) {
//
//            function select ( option, options ) {
//                for ( var btn in options ) {
//                    if ( options[ btn ].id === option ) {
//                        options[ btn ].isSelected = true;
//                    }
//                    else {
//                        options[ btn ].isSelected = false;
//                    }
//                }
//            };
//
//            select( $scope.selectedId, $scope.optionsArray );
//
//            this.selectOption = function ( channel, args ) {
//                $scope.selectedId = args.option.id;
////                $log.warn($scope.selectedId);
//                select( args.option.id, $scope.optionsArray );
//                $scope.$apply();
//            };
//
//            // I do it to make 'channelGroup' available in nested controller.
//            this.channelGroup = $scope.channelGroup;
//
//            channels.subscribe( this.channelGroup.update, this.selectOption );
//
//        }],
//
//        scope: {
//            channelGroup: "=",
//            optionsArray: "=",
//            selectedId: "=",
//        },
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
//
//        }
//    }
//}]);
//
//pf.directive('btnInMultipleBtnsSelect', ['channels', function( channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/common/btnInMultipleBtnsSelect.html",
//        restrict: 'E',
//        replace: false,
//        require: '^multipleBtnsSelect',
//        scope: {
//            option: "=",
//            object: "="
//        },
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
//            el.on( 'click', function() {
////                console.log(scope.option);
//                channels.publish( controller.channelGroup.update, { option: scope.option });
//            });
//        }
//    }
//}]);
//
//pf.directive('deleteBtn', [ 'channels', function( channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/common/deleteBtn.html",
//        replace: false,
//        scope: {
//            objectGuidToDelete: "=",
//            channelGroup: "="
//        },
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
//            el.on('click', function() {
//                channels.publish( scope.channelGroup.delete, { guid: scope.objectGuidToDelete } );
//            });
//        }
//    }
//}]);
//
//pf.directive('expenseAmountWithCurrency', [ 'channels', function( channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/common/expenseAmountWithCurrency.html",
//        replace: false,
//        controller: [ '$scope', '$log', 'expenses', function ( $scope, $log, expenses) {
//            $scope.setCurrencyIcon = function ( id ) {
//                return expenses.getCurrencyById( id ).className;
//            };
//
//            $scope.formatAmount = function ( num ) {
//                return numeral( num ).format( '0,0[.]00' );
//            }
//        }],
//        scope: {
//            expenseAmount: "=",
//            currencyId: "="
//        },
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
//
//
//        }
//    }
//}]);
//
//pf.directive('expenseInputForm', [ 'expenses', 'channels', function( expenses, channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/apps/expensesapp/expenseInputForm.html",
//        replace: false,
//        controller: ['$scope', '$log', function ( $scope, $log ) {
//
//            $scope.categories = expenses.getCategories();
//
//            $scope.currencies = expenses.getCurrencies();
//
//            $scope.allChannelGroups = channels.getChannelGroup();
//
//            var self = this;
//
//            this.create = function( channel, args ) {
//                expenses.create( channel, args );
//                $scope.newExpense = expenses.getEmpty();
//                self.updateMultipleBtnSelectors();
//            };
//
//            this.updateMultipleBtnSelectors = function () {
//                var e = $scope.newExpense;
//                var optionCurency = {
//                    option: expenses.getCurrencyById( e.spentCurrencyId )
//                };
//                var optionCategory = {
//                    option: expenses.getCategoryById( e.categoryId )
//                };
//                channels.publish( $scope.allChannelGroups.category.update, optionCategory );
//                channels.publish( $scope.allChannelGroups.currency.update, optionCurency );
//            };
//
//            this.updateCategoryName = function( channel, args ) {
//                $scope.selectedCategoryName = expenses.getCategoryNameById( $scope.newExpense.categoryId );
//                $scope.$apply();
//            };
//
//            $scope.newExpense = expenses.getEmpty();
//            this.updateMultipleBtnSelectors();
//
//            $scope.selectedCategoryName = expenses.getCategoryNameById( $scope.newExpense.categoryId );
//
//            channels.subscribe( $scope.allChannelGroups.expense.save, this.create );
//
//            channels.subscribe( $scope.allChannelGroups.category.update, this.updateCategoryName );
//
//        }],
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
//
//        }
//    }
//}]);
//
//pf.directive('expensesView', [ 'expenses', 'channels', function( expenses, channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/apps/expensesapp/expensesView.html",
//        replace: false,
//        controller: ['$scope', '$log', function( $scope, $log ) {
//            $scope.expenses = expenses.getAll();
//
//            this.channelGroup = channels.getChannelGroup( "expense" );
//
//            channels.subscribe( this.channelGroup.saved, function () {
//                $scope.expenses = expenses.getAll();
//            });
//
//            this.delete = function ( channel, args ) {
//                expenses.delete( channel, args );
//            }
//
//            channels.subscribe( this.channelGroup.delete, this.delete );
//
//            channels.subscribe( this.channelGroup.deleted, function () {
//                $scope.expenses = expenses.getAll();
//                $scope.$apply();
//            });
//        }],
//        scope: {
//        },
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
//        }
//    }
//}]);
//
//pf.directive('oneExpenseView', [ 'channels', 'expenses', function( channels, expenses ) {
//
//    return {
//
//        templateUrl: "/assets/js/apps/expensesapp/oneExpenseView.html",
//        replace: false,
//        controller: [ '$scope', '$log', function( $scope, $log ){
//            $scope.formatDate = function ( date ) {
////                $log.debug('formatDate is called');
//                return moment( date ).format( 'DD/MM/YYYY' );
//            };
//
//            $scope.setCategoryName = function( id ) {
//                return expenses.getCategoryNameById( id );
//            };
//
//            $scope.channelGroup = channels.getChannelGroup( "expense" );
//
//        }],
//        scope: {
//            expenseObject: "=",
//        },
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
//        }
//    }
//}]);
//
//pf.directive('chart1', [ 'charts', 'channels', function( charts, channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/apps/chartsapp/chart1.html",
//        replace: false,
//        controller: ['$scope', '$log', function ( $scope, $log ) {
//
//            var myChannels = channels.getChannels( 'services', 'charts' );
//
//            $scope.chart1 = charts.getChart1();
//
////            $log.debug($scope.chart1);
//            $scope.channelGroup = channels.getChannelGroup("charts").chart1;
//
//            channels.subscribe( myChannels.chart1Ready, function ( channel, args ) {
//                $log.debug( args );
//            });
//
//
//        }],
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
////            console.log(attrs["$$element"][0].parentElement.clientHeight);
////            console.log(attrs["$$element"][0].clientHeight);
////            console.log(attrs["$$element"]);
//
//            Plotly.newPlot( "chart-1", scope.chart1, { height: 200, margin: { l: 40, r: 10, t: 20, b: 25 } } );
//        }
//
//    }
//}]);
//
//pf.directive('chart2', [ 'charts', 'channels', function( charts, channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/apps/chartsapp/chart2.html",
//        replace: false,
//        controller: ['$scope', '$log', function ( $scope, $log ) {
//
//            $scope.chart2 = charts.getChart2();
//
////            $log.debug($scope.chart2);
//            $scope.channelGroup = channels.getChannelGroup("charts").chart2;
//
//        }],
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
////            console.log(attrs["$$element"][0].parentElement.clientHeight);
////            console.log(attrs["$$element"][0].clientHeight);
////            console.log(attrs["$$element"]);
//
//            Plotly.newPlot( "chart-2", scope.chart2, { height: 200, margin: { l: 40, r: 10, t: 20, b: 25 } } );
//        }
//
//    }
//}]);
//
//pf.directive('chart3', [ 'charts', 'channels', function( charts, channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/apps/chartsapp/chart3.html",
//        replace: false,
//        controller: ['$scope', '$log', function ( $scope, $log ) {
//
//            $scope.chart3 = charts.getChart3();
//
////            $log.debug($scope.chart3);
//            $scope.channelGroup = channels.getChannelGroup("charts").chart3;
//
//        }],
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
////            console.log(attrs["$$element"][0].parentElement.clientHeight);
////            console.log(attrs["$$element"][0].clientHeight);
////            console.log(attrs["$$element"]);
//
//            Plotly.newPlot( "chart-3", scope.chart3, { height: 200, margin: { l: 5, r: 5, t: 5, b: 5 } } );
//        }
//
//    }
//}]);
//
//pf.directive('chart4', [ 'charts', 'channels', function( charts, channels ) {
//
//    return {
//
//        templateUrl: "/assets/js/apps/chartsapp/chart4.html",
//        replace: false,
//        controller: ['$scope', '$log', function ( $scope, $log ) {
//
//            $scope.chart4 = charts.getChart4();
//
////            $log.debug($scope.chart4);
//            $scope.channelGroup = channels.getChannelGroup("charts").chart4;
//
//        }],
//
//        link: function ( scope, el, attrs, controller, transcludeFn ) {
////            console.log(attrs["$$element"][0].parentElement.clientHeight);
////            console.log(attrs["$$element"][0].clientHeight);
////            console.log(attrs["$$element"]);
//
//            Plotly.newPlot( "chart-4", scope.chart4, { height: 200, margin: { l: 5, r: 5, t: 5, b: 5 } } );
//        }
//
//    }
//}]);

// TODO. Write code for all directives between ==== bars, then delete all above directives
// =========================
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

exports.dateSelector = function () {

    return {
        controller: 'DateSelectorCtrl',
        templateUrl: '/assets/templates/dateSelector.html'
    }
};

exports.chartsView = function () {

    return {
        controller: 'ChartsViewCtrl',
        templateUrl: '/assets/templates/chart1.html'
    }

};


// =========================