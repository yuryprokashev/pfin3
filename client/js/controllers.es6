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
        clipboard:[]
    };

    $scope.cache = {
        calendars: new Map()
    };

    $scope.pushListener = new PusherClient();

    // param: String newDay - the day in string format "YYYYMMDD" for which we want to get week number (from 0 to 3-5)
    // function: calculate the number of week, where given day belongs to.
    // return: int weekNum
    var getWeekForDay = function getWeekForDay(newDay) {
        var y = MyDates.getYearFromString(newDay);
        var m = MyDates.getMonthFromString(newDay);
        var d = MyDates.getDateFromString(newDay);
        var date = new Date(y, m - 1, d);
        // console.log(date);
        return MyDates.numberOfWeek(date);
    };

    var getDayCode = function getDayCode() {
        var d = $scope.state.dayRef !== undefined ? $scope.state.dayRef.timeWindow : $scope.state.init.day;
        return MyDates.getDateFromString(d);
    };

    var setWeekRef = function setWeekRef(dayNum) {
        if (dayNum > MyDates.daysInMonth($scope.state.monthRef.monthString)) {
            dayNum = MyDates.daysInMonth($scope.state.monthRef.monthString);
        }
        var dayCode = $scope.state.monthRef.monthString + MyDates.dayToString(dayNum);
        var newWeek = getWeekForDay(dayCode);
        return $scope.view.calendarView.weeks[newWeek];
    };

    var setDayRef = function setDayRef(dayCode) {
        dayCode = $scope.state.monthRef.monthString + MyDates.dayToString(dayCode);
        return $scope.state.weekRef.getDayRef(dayCode);
    };

    var getPreviousMonthRef = function getPreviousMonthRef(targetMonth) {
        var targetMonthIndex = $scope.view.monthSwitch.months.indexOf(targetMonth);
        return targetMonthIndex - 1 >= 0 ? $scope.view.monthSwitch.months[targetMonthIndex - 1] : targetMonth;
    };

    var stopCommandProcessing = function stopCommandProcessing() {
        if ($scope.state.isCommandProcessing === true) {
            $scope.state.isCommandProcessing = false;
        }
    };

    var startCommandProcessing = function startCommandProcessing() {
        $scope.state.isCommandProcessing = true;
    };

    var setContextMenuOptions = function setContextMenuOptions() {
        $scope.view.monthSwitch.months.forEach(function (item) {
            item.ctxMenu.setOptionsAsync();
        });
    };

    var getDaysAsync = function getDaysAsync() {
        var days = $scope.view.calendarView.getFlatDays();
        // console.log(days);
        var completed = 0;
        var responses = [];

        var finish = function finish() {
            responses.sort(function (a, b) {
                if (a.dayNum > b.dayNum) {
                    return 1;
                } else if (a.dayNum < b.dayNum) {
                    return -1;
                }
            });

            var _loop = function _loop(i) {
                var items = responses[i].items;
                var result = [];
                items.forEach(function (item) {
                    var transformedItem = UIItem.transformToUIItem(item);
                    transformedItem.isItemProcessing = false;
                    transformedItem.isSaved = true;
                    result.push(transformedItem);
                });
                days[i].day.html.items = result;
                days[i].day.update();
            };

            for (var i = 0; i < days.length; i++) {
                _loop(i);
            }
            stopCommandProcessing();
        };

        days.forEach(function (item) {
            $http.get(item.day.getUrl).then(function (res) {
                responses.push({ dayNum: item.dayNum, items: res.data });
                if (++completed === days.length) {
                    finish();
                }
            });
        });
    };

    var getDaysAsync2 = function getDaysAsync2() {
        // HELPERS
        function getAllItemsForMonth(fnSuccess, fnError) {
            $http.get('/api/v1/payload/' + $scope.state.monthRef.monthString + '/1/dayCode/-1').then(fnSuccess).catch(fnError);
        }
        function setItemsToDays(response) {
            // let days = $scope.view.calendarView.getFlatDays();
            var groupedItems = [];
            function isDataForDayExists(day) {
                return groupedItems[day.timeWindow] !== undefined;
            }
            response.data.map(function (item) {
                if (groupedItems[item.dayCode] === undefined) {
                    groupedItems[item.dayCode] = { dayCode: item.dayCode, items: [] };
                }
                groupedItems[item.dayCode].items.push(item);
            });
            // console.log(groupedItems);
            days.forEach(function (day) {
                // console.log(day.day);
                // console.log(groupedItems[day.day.timeWindow]);
                if (isDataForDayExists(day.day)) {
                    day.day.html.items = groupedItems[day.day.timeWindow].items.map(function (item) {
                        var transformedItem = UIItem.transformToUIItem(item);
                        transformedItem.isItemProcessing = false;
                        transformedItem.isSaved = true;
                        return transformedItem;
                    });
                } else {
                    day.day.html.items = [];
                }
                day.day.update();
                stopCommandProcessing();
            });
        }

        function logError(err) {
            console.log(err);
        }

        // MAIN FLOW
        var days = $scope.view.calendarView.getFlatDays();
        $scope.$applyAsync(function () {
            getAllItemsForMonth(setItemsToDays, logError);
        });
    };

    function showContextMenu(ctxMenu) {
        $scope.state.ctxMenuRef = ctxMenu;
        $scope.state.ctxMenuRef.show();
    }

    function hideContextMenu() {
        if (isContextMenuShown()) {
            $scope.state.ctxMenuRef.hide();
            $scope.state.ctxMenuRef = undefined;
        }
    }

    function selectMonthAsync(month) {
        $scope.$applyAsync(function () {
            $scope.state.monthRef.html.isSelected = false;
            $scope.state.monthRef = month;
            $scope.state.monthRef.html.isSelected = true;

            if ($scope.cache.calendars.has(month.monthString)) {
                $scope.view.calendarView = $scope.cache.calendars.get(month.monthString);
            } else {
                var newCalendar = $scope.view.initCalendarView();
                $scope.view.calendarView = newCalendar;
                getDaysAsync2();
                $scope.cache.calendars.set($scope.state.monthRef.monthString, newCalendar);
            }
            var dayCode = getDayCode();
            $scope.state.weekRef = setWeekRef(dayCode);
            $scope.state.dayRef = setDayRef(dayCode);
            $scope.view.calendarView.update();
        });
    }

    function commandCallback(response) {
        hideContextMenu();
        $scope.$applyAsync(function () {
            getDaysAsync2();
            getMonthDataAsync();
            $scope.view.calendarView.update();
        });
    }

    function sendCommandAsync(option, callback) {
        var cmdId = guid();
        // $scope.pushListener.register(cmdId, getDaysAsync);
        console.log(option.getUrl + '/' + cmdId);
        $http.get(option.getUrl + '/' + cmdId).then(function (response) {
            callback(response);
            // stopCommandProcessing();
        });
    }

    function isCurrentMonthClicked(month) {
        return $scope.state.monthRef.monthString === month.monthString;
    }

    function isMessageFormShown() {
        return $scope.state.isFormShown;
    }

    function isContextMenuShown() {
        return $scope.state.ctxMenuRef !== undefined && $scope.state.ctxMenuRef.html.isShown === true;
    }

    function isContextMenuOfCurrentMonthClicked() {
        return $scope.state.ctxMenuRef.target === $scope.state.monthRef;
    }

    function getMonthDataAsync() {
        var m = $scope.state.monthRef;
        function setMonthDataFromResponse(response) {
            // console.log(response);
            m.update(response.data.totals);
        }
        function logError(err) {
            console.log(err);
        }
        $http.get(m.getUrl).then(setMonthDataFromResponse, logError);
    }

    function getMonthDataAsync2(month) {
        function setMonthDataFromResponse(response) {
            // console.log(response);
            month.update(response.data.totals);
        }
        function logError(err) {
            console.log(err);
        }
        $http.get(month.getUrl).then(setMonthDataFromResponse, logError);
    }

    $user.getUser(function success() {
        $scope.state.user = $user.user;
        $scope.view = $views.initAppView($scope.state);
    });

    $scope.state.getPreviousMonthRef = getPreviousMonthRef;

    $scope.$on('directive::monthSwitch::ready', function (event, args) {

        var months = $scope.view.monthSwitch.months;
        var completed = 0;
        var responses = [];

        var finish = function finish() {
            responses.sort(function (a, b) {
                if (a.index > b.index) {
                    return 1;
                } else if (a.index < b.index) {
                    return -1;
                }
            });

            for (var i = 0; i < $scope.view.monthSwitch.months.length; i++) {
                $scope.view.monthSwitch.months[i].update(responses[i].totals);
            }
            var newCalendar = $scope.view.initCalendarView($scope.state);
            $scope.view.calendarView = newCalendar;
            $scope.cache.calendars.set($scope.state.monthRef.monthString, newCalendar);

            getDaysAsync2();
            $scope.$emit('directive::calendarView::ready');
        };

        months.forEach(function (m) {
            $http.get(m.getUrl).then(function (res) {
                responses.push({ index: months.indexOf(m), totals: res.data.totals });
                if (++completed === months.length) {
                    finish();
                }
            });
        });
        $scope.state.monthRef = args.monthRef;
        $scope.state.init.month = undefined;

        setContextMenuOptions();
    });

    $scope.$on('directive::calendarView::ready', function (event, args) {
        console.log('directive::calendarView::ready');
        var dayCode = getDayCode();
        $scope.state.weekRef = setWeekRef(dayCode);
        $scope.state.dayRef = setDayRef(dayCode);
        $scope.view.calendarView.update();
        $scope.view.initExpensePoster($scope.state);

        // console.log($scope.state);
    });

    $scope.$on('clicked::month', function (event, args) {

        if (isMessageFormShown()) {
            $scope.state.isFormShown = false;
        }

        if (isCurrentMonthClicked(args.month) && isContextMenuShown()) {
            hideContextMenu($scope.state.ctxMenuRef);
        } else if (!isCurrentMonthClicked(args.month) && isContextMenuShown()) {
            selectMonthAsync(args.month);
            hideContextMenu();
        } else {
            selectMonthAsync(args.month);
        }
    });

    $scope.$on('clicked::item', function (event, args) {
        // console.log('clicked::item');
        // $scope.state.itemRef = args.item;
        // var dayNum = MyDates.getDateFromString(args.item.dayCode);
        // $scope.state.weekRef = setWeekRef(dayNum);
        // $scope.state.dayRef = setDayRef(dayNum);
        // $scope.view.calendarView.update();

        selectItem(args.item);

        $scope.state.isFormShown = true;
        // $scope.view.expensePoster.update();

        hideContextMenu($scope.state.ctxMenuRef);

        $scope.$apply(function () {
            $scope.view.calendarView.update();
            $scope.view.expensePoster.update();
        });
    });

    var clicks = [];
    $scope.$on('clicked::day', function (event, args) {
        // This process is async, since we always wait for second click after first
        // This process changes State
        // This process relies on data in event to be done
        // This process must change the selected day to new one.
        // This process must check, if the day is the same and do nothing.
        // start: 'clicked::day' is fired. we create a promise that there will be another click in 300ms
        // then: if promise is resolved, we fire 'dblclicked::day' event
        // if promise is rejected we fire 'change::day' event
        console.log('clicked::day');
        clicks.push(event);
        if (isContextMenuShown()) {
            hideContextMenu($scope.state.ctxMenuRef);
        }
        $scope.state.dayRef = args.day;
        $scope.state.itemRef = undefined;
        $scope.state.weekRef = setWeekRef($scope.state.dayRef.dayNum);
        if ($scope.state.isFormShown === true) {
            $scope.state.isFormShown = false;
        }
        $scope.view.calendarView.update();
        $scope.view.expensePoster.update();

        $timeout(function () {
            if (clicks.length === 1) {
                // var newDay = $scope.state.monthRef.monthString + MyDates.dayToString(args.day.dayNum);
                // $scope.state.itemRef = undefined;
                // $scope.state.weekRef = setWeekRef($scope.state.dayRef.dayNum);

                // if($scope.state.isFormShown === true) {
                //     $scope.state.isFormShown = false;
                // }
                // $scope.view.calendarView.update();
                // $scope.view.expensePoster.update();
            } else if (clicks.length >= 2) {
                $scope.$emit('dblclicked::day', { day: args.day });
            }
            clicks = [];
        }, 200);
    });

    $scope.$on('dblclicked::day', function (event, args) {

        // This process is async
        // This process changes State
        // This process relies on data in event to be done
        // This process must create new item upon dblclick and open the messageForm for it
        // This process must check the dayCode of clicked day, so new item is shown as Plan or as Fact in UI
        console.log('dblclicked::day');
        var day = args.day;
        var isFuture = day.html.isFuture;
        var item = new UIItem(1, 0, "New item", day.timeWindow, { isPlan: isFuture, isDeleted: false }, false);
        $scope.state.itemRef = item;
        day.addItem(item);
        $scope.$apply(function () {
            $scope.state.dayRef.update();
            $scope.view.expensePoster.update();
        });
    });

    $scope.$on("compiled::item", function (event, args) {
        // This process is sync
        // This process changes State
        // This process relies on data in event to be done.
        // This process must end with messageForm shown for the new item, just added to DOM with dbl-click.
        // start: item is compiled to DOM -> 'compiled::item fires
        // then: we check if State.currentItem is equal to item in event.
        // then: if not, we do nothing
        // then: if yes, we must show messageForm.
        console.log('compiled::item');
        if ($scope.state.itemRef === args.item) {
            $scope.state.isFormShown = true;
            $scope.view.expensePoster.update();
        }
    });

    function sendItemUpdate(form, btn, pushCb){

        // @function: executed after updateData from server has arrived. Updates target object with updateData;
        // @param: Array [Object] updateData - the result of async http call to server.
        // @param: Object target - the object, that has to be updated with updateData
        // @return: void
        var saveCallback = function saveCallback(response) {
            // console.log(`saveCallback on ${response.data._id}`);
            $scope.state.itemRef.setItemFromForm(form);
            $scope.state.itemRef.isItemProcessing = true;
            $scope.state.itemRef.isSaved = false;
            $scope.state.isFormShown = false;
            $scope.view.calendarView.update();
            $scope.view.expensePoster.update();
            getMonthDataAsync();
        };

        var token = guid();
        $scope.pushListener.register(token, pushCb);
        var message = form.assembleMessage(btn, token);
        $http.post(form.postUrl, message).then(saveCallback);

    }

    $scope.$on('clicked::item::btn', function (event, args) {

        var pushCallback = function pushCallback(pushData) {
            // console.log(`pushCallback on ${pushData}`);
            var dayNum = MyDates.getDateFromString(pushData);
            var week = setWeekRef(dayNum);
            var day = week.getDayRef(pushData);
            $http.get(day.getUrl).then(function (res) {
                var items = res.data;
                var result = [];
                items.forEach(function (item) {
                    var transformedItem = UIItem.transformToUIItem(item);
                    transformedItem.isItemProcessing = false;
                    transformedItem.isSaved = true;
                    result.push(transformedItem);
                });
                $scope.$applyAsync(function () {
                    day.html.items = result;
                    day.update();
                });
            });
        };

        // @function: executed after updateData from server has arrived. Updates target object with updateData;
        // @param: Array [Object] updateData - the result of async http call to server.
        // @param: Object target - the object, that has to be updated with updateData
        // @return: void
        var saveCallback = function saveCallback(response) {
            // console.log(`saveCallback on ${response.data._id}`);
            $scope.state.itemRef.setItemFromForm(args.form);
            $scope.state.itemRef.isItemProcessing = true;
            $scope.state.itemRef.isSaved = false;
            $scope.state.isFormShown = false;
            $scope.view.calendarView.update();
            $scope.view.expensePoster.update();
            getMonthDataAsync();
        };

        var token = guid();
        $scope.pushListener.register(token, pushCallback);
        var message = args.form.assembleMessage(args.btn, token);
        $http.post(args.form.postUrl, message).then(saveCallback);
    });

    $scope.$on('clicked::ctxMenu', function (event, args) {

        if (isContextMenuShown() && !isContextMenuOfCurrentMonthClicked()) {
            hideContextMenu();
            selectMonthAsync(args.ctxMenu.target);
            showContextMenu(args.ctxMenu);
        }

        if (isContextMenuShown() && isContextMenuOfCurrentMonthClicked()) {
            hideContextMenu();
        }

        if (!isContextMenuShown()) {
            selectMonthAsync(args.ctxMenu.target);
            showContextMenu(args.ctxMenu);
        }
    });

    $scope.$on('clicked::ctxMenu::option', function (event, args) {
        sendCommandAsync(args.option, commandCallback);
        startCommandProcessing();
    });

    $scope.$on('clicked::chevron', function (event, args) {
        var createdMonths = args.monthSwitch.moveWindow(args.step);
        $scope.$applyAsync(function () {
            createdMonths.forEach(getMonthDataAsync2);
        });
    });

    $scope.$on('dropped::item', handleItemDrop);
    function handleItemDrop(event, args) {
        // -- запомнить, откуда был drag
        let dragSource = $scope.state.dayRef;
        // -- выбрать в UI день, куда был drop.
        $scope.state.dayRef = args.dropTargetDay;
        // -- изменить у выбранного item день со старого на новый.
        $scope.state.itemRef.dayCode = args.dropTargetDay.dayCode;
        // -- показать item  полупрозрачным - он ведь еще не сохранился
        $scope.state.itemRef.isSaved = false;
        $scope.$apply(function(){
            args.dropTargetDay.update();
            dragSource.update();
            $scope.view.calendarView.update();
        });
        $scope.view.expensePoster.update();
        // -- собрать Message из item.
        let clientToken = guid();
        let message = $scope.view.expensePoster.assembleMessage('save', clientToken);
        // -- послать Message на сервер POST /message/:dayCode, dayCode - это 'dropTarget'.
        // -- По приходу 200 на POST надо выполнить saveCallback:
        let saveCallback = function(){
            //     --- зарегистрировать в $scope.pushListener новый push и ждать, пока он придет.
            $scope.pushListener.register(clientToken, pushCallback);
        };
        $http.post($scope.view.expensePoster.postUrl, message).then(saveCallback);

        let pushCallback = function (pushData) {
            // ---- обновить день dragSource
            $http.get(dragSource.getUrl).then(function (res) {
                var items = res.data;
                var result = [];
                items.forEach(function (item) {
                    var transformedItem = UIItem.transformToUIItem(item);
                    transformedItem.isItemProcessing = false;
                    transformedItem.isSaved = true;
                    result.push(transformedItem);
                });
                $scope.$applyAsync(function () {
                    dragSource.html.items = result;
                    dragSource.update();
                });
            });

            // ---- обновить день dropTarget
            $http.get(args.dropTargetDay.getUrl).then(function (res) {
                var items = res.data;
                var result = [];
                items.forEach(function (item) {
                    var transformedItem = UIItem.transformToUIItem(item);
                    transformedItem.isItemProcessing = false;
                    transformedItem.isSaved = true;
                    result.push(transformedItem);
                });
                $scope.$applyAsync(function () {
                    args.dropTargetDay.html.items = result;
                    args.dropTargetDay.update();
                });
            });
        }
    }

    $scope.$on('dragged::item::start', handleItemDragStart);
    function selectItem(item){
        let clip = $scope.state.clipboard;
        if(clip[0] !== undefined && clip[0].isCopied === true){
            console.log(`item in clipboard exits = ${clip[0].isCopied}`);
            clip[0].isCopied = false;
            clip.pop();
        }
        if(item.isCopied){
            item.isCopied = false;
        }
        $scope.state.itemRef = item;
        var dayNum = MyDates.getDateFromString(item.dayCode);
        $scope.state.weekRef = setWeekRef(dayNum);
        $scope.state.dayRef = setDayRef(dayNum);
    }
    function handleItemDragStart(event, args) {
        // console.log(args);
        selectItem(args.item);
        $scope.view.expensePoster.update();
    }

    let handleCopy = require('./controllerEventHandlers/handleCopy');
    $scope.$on('pressed::key::copy',
        (function(s){
            return function(event, args){
                handleCopy(event, args, s);
            };
        })($scope)
    );

    const handlePaste = require('./controllerEventHandlers/handlePaste');
    $scope.$on('pressed::key::paste',
        (function(s, http){
            return function(event, args){
                handlePaste(event, args, s, http);
            };
        })($scope, $http)
    );

    const handleMonthDataChange = require('./controllerEventHandlers/handleMonthDataChange');
    $scope.$on('monthdata::change',
        (function(s, http){
            return function (event, args) {
                handleMonthDataChange(event, args, s, http);
            };
        })($scope, $http)
    );

};

//# sourceMappingURL=controllers.es6.map