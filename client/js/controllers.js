'use strict';

exports.pfinAppCtrl = function ($scope, $views, $user, $timeout, $http) {
    var MyDates = require('./MyDates');
    var UIItem = require('./UIItem');
    var PusherClient = require('./PusherClient2');
    var guid = require('./guid');

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
        clipboard: []
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

    var handleDirectiveMonthSwitchReady = require('./controllerEventHandlers/handleDirectiveMonthSwitchReady');
    $scope.$on('directive::monthSwitch::ready', function (s, h) {
        return function (event, args) {
            handleDirectiveMonthSwitchReady(event, args, s, h);
        };
    }($scope, $http));

    var handleDirectiveCalendarViewReady = require('./controllerEventHandlers/handleDirectiveCalendarViewReady');
    $scope.$on('directive::calendarView::ready', function (s) {
        return function (event, args) {
            handleDirectiveCalendarViewReady(event, args, s);
        };
    }($scope));

    var handleClickedMonth = require('./controllerEventHandlers/handleClickedMonth');
    $scope.$on('clicked::month', function (s, h) {
        return function (event, args) {
            handleClickedMonth(event, args, s, h);
        };
    }($scope, $http));

    $scope.clicks = [];
    var handleClickedDay = require('./controllerEventHandlers/handleClickedDay');
    $scope.$on('clicked::day', function (s, t) {
        return function (event, args) {
            handleClickedDay(event, args, s, t);
        };
    }($scope, $timeout));

    var handleDblClickedDay = require('./controllerEventHandlers/handleDoubleClickedDay');
    $scope.$on('dblclicked::day', function (s) {
        return function (event, args) {
            handleDblClickedDay(event, args, s);
        };
    }($scope));

    var handleClickedItem = require('./controllerEventHandlers/handleClickedItem');
    $scope.$on('clicked::item', function (s) {
        return function (event, args) {
            handleClickedItem(event, args, s);
        };
    }($scope));

    var handleCompiledItem = require('./controllerEventHandlers/handleCompiledItem');
    $scope.$on("compiled::item", function (s) {
        return function (event, args) {
            handleCompiledItem(event, args, s);
        };
    }($scope));

    var handleClickedItemBtn = require('./controllerEventHandlers/handleClickedItemBtn');
    $scope.$on('clicked::item::btn', function (s, h) {
        return function (event, args) {
            handleClickedItemBtn(event, args, s, h);
        };
    }($scope, $http));

    var handleClickedCtxMenu = require('./controllerEventHandlers/handleClickedContextMenu');
    $scope.$on('clicked::ctxMenu', function (s, h) {
        return function (event, args) {
            handleClickedCtxMenu(event, args, s, h);
        };
    }($scope, $http));

    var handleClickedCtxMenuOption = require('./controllerEventHandlers/handleClickedCtxMenuOption');
    $scope.$on('clicked::ctxMenu::option', function (s, http) {
        return function (event, args) {
            handleClickedCtxMenuOption(event, args, s, http);
        };
    }($scope, $http));

    var handleClickedChevron = require('./controllerEventHandlers/handleClickedChevron');
    $scope.$on('clicked::chevron', function (s, http) {
        return function (event, args) {
            handleClickedChevron(event, args, s, http);
        };
    }($scope, $http));

    var handleItemDrop = require('./controllerEventHandlers/handleItemDrop');
    $scope.$on('dropped::item', function (s, http) {
        return function (event, args) {
            handleItemDrop(event, args, s, http);
        };
    }($scope, $http));

    var handleItemDragStart = require('./controllerEventHandlers/handleItemDragStart');
    $scope.$on('dragged::item::start', function (s) {
        return function (event, args) {
            handleItemDragStart(event, args, s);
        };
    }($scope));

    var handleCopy = require('./controllerEventHandlers/handleCopy');
    $scope.$on('pressed::key::copy', function (s) {
        return function (event, args) {
            handleCopy(event, args, s);
        };
    }($scope));

    var handlePaste = require('./controllerEventHandlers/handlePaste');
    $scope.$on('pressed::key::paste', function (s, http) {
        return function (event, args) {
            handlePaste(event, args, s, http);
        };
    }($scope, $http));

    var handleMonthDataChange = require('./controllerEventHandlers/handleMonthDataChange');
    $scope.$on('monthdata::change', function (s, http) {
        return function (event, args) {
            handleMonthDataChange(event, args, s, http);
        };
    }($scope, $http));
};

//# sourceMappingURL=controllers.es6.map

//# sourceMappingURL=controllers.js.map