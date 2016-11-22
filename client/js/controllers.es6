'use strict';

exports.pfinAppCtrl = function ($scope, $views, $user, $timeout, $http) {
    var MyDates = require('./MyDates.es6');
    var UIItem = require('./UIItem.es6');
    var PusherClient = require('./PusherClient2.es6');
    var guid = require('./guid.es6');

    $scope.state = {
        init: {
            month: MyDates.dateToString(new Date(), { y: 1, m: 1, d: undefined }),
            week: MyDates.numberOfWeek(new Date()),
            day: MyDates.dateToString(new Date())
        },
        previousMonthRef: undefined,
        monthRef: undefined,
        weekRef: undefined,
        dayRef: undefined,
        itemRef: undefined,
        ctxMenuRef: undefined,
        isFormShown: false,
        payloadType: 1,
        sortParam: "occuredAt",
        sortOrder: -1,
        updatedDays: [],
        updatedMonths: [],
        user: {},
        clipboard:[]
    };

    $scope.cache = {
        calendars: new Map()
    };

    $scope.pushListener = new PusherClient();

    $user.getUser(function success() {
        $scope.state.user = $user.user;
        $scope.view = $views.initAppView($scope.state);
    });

    $scope.state.getPreviousMonthRef = function (targetMonth) {
        var targetMonthIndex = $scope.view.monthSwitch.months.indexOf(targetMonth);
        return targetMonthIndex - 1 >= 0 ? $scope.view.monthSwitch.months[targetMonthIndex - 1] : targetMonth;
    };;

    const handleDirectiveMonthSwitchReady = require('./controllerEventHandlers/handleDirectiveMonthSwitchReady.es6');
    $scope.$on('directive::monthSwitch::ready',
        (function(s,h){
            return function(event, args){
                handleDirectiveMonthSwitchReady(event, args, s, h);
            }
        })($scope, $http)
    );

    const handleDirectiveCalendarViewReady = require('./controllerEventHandlers/handleDirectiveCalendarViewReady.es6');
    $scope.$on('directive::calendarView::ready',
        (function (s){
            return function(event, args){
                handleDirectiveCalendarViewReady(event, args, s);
            };
        })($scope)
    );

    const handleClickedMonth = require('./controllerEventHandlers/handleClickedMonth.es6');
    $scope.$on('clicked::month',
        (function(s, h){
            return function(event, args){
                handleClickedMonth(event, args, s, h);
            };
        })($scope, $http)
    );

    $scope.clicks = [];
    const handleClickedDay = require('./controllerEventHandlers/handleClickedDay.es6');
    $scope.$on('clicked::day',
        (function(s, t){
            return function(event, args){
                handleClickedDay(event, args, s, t);
            };
        })($scope, $timeout)
    );

    const handleDblClickedDay = require('./controllerEventHandlers/handleDoubleClickedDay.es6')
    $scope.$on('dblclicked::day',
        (function(s){
                return function (event, args) {
                    handleDblClickedDay(event, args, s);
                };
            }
        )($scope)
    );

    const handleClickedItem = require('./controllerEventHandlers/handleClickedItem.es6');
    $scope.$on('clicked::item',
        (function(s){
            return function (event, args){
                handleClickedItem(event, args, s);
            };
        })($scope)
    );

    const handleCompiledItem = require('./controllerEventHandlers/handleCompiledItem.es6');
    $scope.$on("compiled::item",
        (function (s) {
            return function(event, args){
                handleCompiledItem(event, args, s);
            };
        })($scope)
    );

    const handleClickedItemBtn = require('./controllerEventHandlers/handleClickedItemBtn.es6');
    $scope.$on('clicked::item::btn',
        (function(s,h){
                return function(event, args){
                    handleClickedItemBtn(event, args, s, h);
                };
            }
        )($scope, $http)
    );

    const handleClickedCtxMenu = require('./controllerEventHandlers/handleClickedContextMenu.es6');
    $scope.$on('clicked::ctxMenu',
        (function(s, h){
            return function (event, args){
                handleClickedCtxMenu(event, args, s, h);
            };
        })($scope, $http)
    );

    const handleClickedCtxMenuOption = require('./controllerEventHandlers/handleClickedCtxMenuOption.es6');
    $scope.$on('clicked::ctxMenu::option',
        (function(s, http){
            return function (event, args) {
                handleClickedCtxMenuOption(event, args, s, http);
            };
        })($scope, $http));

    const handleClickedChevron = require('./controllerEventHandlers/handleClickedChevron.es6');
    $scope.$on('clicked::chevron',
        (function(s, http){
            return function (event, args) {
                handleClickedChevron(event, args, s, http);
            };
        })($scope, $http)
    );

    const handleItemDrop = require('./controllerEventHandlers/handleItemDrop.es6');
    $scope.$on('dropped::item',
        (function(s, http){
            return function (event, args) {
                handleItemDrop(event, args, s, http);
            };
        })($scope, $http)
    );

    const handleItemDragStart = require('./controllerEventHandlers/handleItemDragStart.es6');
    $scope.$on('dragged::item::start',
        (function(s){
            return function(event, args){
                handleItemDragStart(event, args, s);
            };
        })($scope));


    const handleCopy = require('./controllerEventHandlers/handleCopy.es6');
    $scope.$on('pressed::key::copy',
        (function(s){
            return function(event, args){
                handleCopy(event, args, s);
            };
        })($scope)
    );

    const handlePaste = require('./controllerEventHandlers/handlePaste.es6');
    $scope.$on('pressed::key::paste',
        (function(s, http){
            return function(event, args){
                handlePaste(event, args, s, http);
            };
        })($scope, $http)
    );

    const handleMonthDataChange = require('./controllerEventHandlers/handleMonthDataChange.es6');
    $scope.$on('monthdata::change',
        (function(s, http){
            return function (event, args) {
                handleMonthDataChange(event, args, s, http);
            };
        })($scope, $http)
    );

};

//# sourceMappingURL=controllers.es6.map