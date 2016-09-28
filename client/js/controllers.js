exports.pfinAppCtrl = function ($scope, $views, $user, $timeout, $http) {
    const MyDates = require('../../common/MyDates');
    const UIItem = require('../../common/UIItem');
    const PusherClient = require('../../common/PusherClient2');
    const guid = require('../../common/guid');

    $scope.state = {
        init: {
            month: MyDates.dateToString(new Date(), {y:1, m:1, d: undefined}),
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
        updatedDays:[],
        updatedMonths:[],
        user: {}
    };
    
    $scope.cache = {
        calendars: new Map()
    };

    $scope.pushListener = new PusherClient();

    $user.getUser(function success(){
        $scope.state.user = $user.user;
    });

    $scope.view = $views.initAppView($scope.state);

    // param: String newDay - the day in string format "YYYYMMDD" for which we want to get week number (from 0 to 3-5)
    // function: calculate the number of week, where given day belongs to.
    // return: int weekNum
    var getWeekForDay = function(newDay) {
        var y = MyDates.getYearFromString(newDay);
        var m = MyDates.getMonthFromString(newDay);
        var d = MyDates.getDateFromString(newDay);
        var date = new Date(y, m - 1, d);
        // console.log(date);
        return MyDates.numberOfWeek(date);
    };

    var getDayCode = function() {
        var d = $scope.state.dayRef !== undefined ? $scope.state.dayRef.timeWindow : $scope.state.init.day;
        return MyDates.getDateFromString(d);
    };

    var setWeekRef = function(dayNum){
        if(dayNum > MyDates.daysInMonth($scope.state.monthRef.monthString)) {
            dayNum = MyDates.daysInMonth($scope.state.monthRef.monthString);
        }
        var dayCode = $scope.state.monthRef.monthString + MyDates.dayToString(dayNum);
        var newWeek = getWeekForDay(dayCode);
        return $scope.view.calendarView.weeks[newWeek];
    };

    var setDayRef = function(dayCode){
        dayCode = $scope.state.monthRef.monthString + MyDates.dayToString(dayCode);
        return $scope.state.weekRef.getDayRef(dayCode);
    };

    var getPreviousMonthRef = function(targetMonth) {
        let targetMonthIndex = $scope.view.monthSwitch.months.indexOf(targetMonth);
        return (targetMonthIndex - 1) >= 0 ? $scope.view.monthSwitch.months[targetMonthIndex - 1] : targetMonth;
    };

    var stopCommandProcessing = function(){
        if($scope.state.isCommandProcessing === true) {
            $scope.state.isCommandProcessing = false;
        }
    };

    $scope.state.getPreviousMonthRef = getPreviousMonthRef;

    var setContextMenuOptions = function(){
        $scope.view.monthSwitch.months.forEach(function(item){
            item.ctxMenu.setOptionsAsync();
        });
    };

    var getDaysAsync = function() {
        var days = $scope.view.calendarView.getFlatDays();
        // console.log(days);
        let completed = 0;
        let responses = [];
        
        var finish = function(){
            responses.sort(function(a,b) {
                if(a.dayNum > b.dayNum) {
                    return 1;
                }
                else if(a.dayNum < b.dayNum){
                    return -1;
                }
            });
            for(let i = 0; i < days.length; i++) {
                let items = responses[i].items;
                let result =  [];
                items.forEach(function(item){
                    let transformedItem = UIItem.transformToUIItem(item);
                    transformedItem.isItemProcessing = false;
                    transformedItem.isSaved = true;
                    result.push(transformedItem);
                });
                days[i].day.html.items = result;
                days[i].day.update();
                stopCommandProcessing();
            }
        };

        days.forEach(function(item){
            $http.get(item.day.getUrl)
                .then(function(res){
                    responses.push({dayNum: item.dayNum, items: res.data});
                    if(++completed === days.length) {
                        finish();
                    }
                })
        });
    };

    function showContextMenu(ctxMenu) {
        $scope.state.ctxMenuRef = ctxMenu;
        $scope.state.ctxMenuRef.show();
    }

    function hideContextMenu() {
        $scope.state.ctxMenuRef.hide();
        $scope.state.ctxMenuRef = undefined;
    }

    function selectMonthAsync(month){
        $scope.$applyAsync(function(){
            $scope.state.monthRef.html.isSelected = false;
            $scope.state.monthRef = month;
            $scope.state.monthRef.html.isSelected = true;

            if($scope.cache.calendars.has(month.monthString)){
                $scope.view.calendarView = $scope.cache.calendars.get(month.monthString);
            }
            else {
                let newCalendar = $scope.view.initCalendarView();
                $scope.view.calendarView = newCalendar;
                getDaysAsync();
                $scope.cache.calendars.set($scope.state.monthRef.monthString, newCalendar);
            }

            var dayCode = getDayCode();
            $scope.state.weekRef = setWeekRef(dayCode);
            $scope.state.dayRef = setDayRef(dayCode);
        })
    }
    
    function copyCommandCallback(response){
        // console.log(response);
        hideContextMenu();
        getDaysAsync();
        stopCommandProcessing();
    }

    function clearCommandCallback(response) {
        console.log(response);
    }

    function sendCommandAsync(option, callback){
        let cmdId = guid();
        // $scope.pushListener.register(cmdId, getDaysAsync);
        console.log(`${option.getUrl}/${cmdId}`);
        $http.get(`${option.getUrl}/${cmdId}`)
            .then(function(response){
                callback(response);
            });
    }

    function isCurrentMonthClicked(month){
        return $scope.state.monthRef.monthString === month.monthString;
    }

    function isMessageFormShown() {
        return $scope.state.isFormShown;
    }

    function isContextMenuShown() {
        return $scope.state.ctxMenuRef !== undefined && $scope.state.ctxMenuRef.html.isShown === true;
    }

    function isContextMenuOfCurrentMonthClicked (){
        return $scope.state.ctxMenuRef.target === $scope.state.monthRef;
    }

    function isCopyOption(option){
        return option.id === "copy";
    }
    
    function isClearOption(option){
        return option.id === "clear";
    }

    $scope.$on('directive::monthSwitch::ready', function(event, args){

        var months = $scope.view.monthSwitch.months;
        let completed = 0;
        var responses = [];

        var finish = function() {
            responses.sort(function(a,b) {
                if(a.index > b.index) {
                    return 1;
                }
                else if(a.index < b.index){
                    return -1;
                }
            });

            for(var i = 0;i < $scope.view.monthSwitch.months.length; i++) {
                $scope.view.monthSwitch.months[i].update(responses[i].totals);
            }
            let newCalendar = $scope.view.initCalendarView($scope.state);
            $scope.view.calendarView = newCalendar;
            getDaysAsync();
            $scope.cache.calendars.set($scope.state.monthRef.monthString, newCalendar);
            $scope.$emit('directive::calendarView::ready');

        };

        months.forEach(function(m){
            $http.get(m.getUrl)
                .then(function (res) {
                    responses.push({index: months.indexOf(m), totals: res.data.totals});
                    if(++completed === months.length) {
                        finish();
                    }
                })
        });
        console.log('directive::monthSwitch::ready');
        $scope.state.monthRef = args.monthRef;
        $scope.state.init.month = undefined;

        setContextMenuOptions();
    });

    $scope.$on('directive::calendarView::ready', function(event, args){
        console.log('directive::calendarView::ready');
        var dayCode = getDayCode();
        $scope.state.weekRef = setWeekRef(dayCode);
        $scope.state.dayRef = setDayRef(dayCode);
        $scope.view.calendarView.update();
        $scope.view.initExpensePoster($scope.state);

        // console.log($scope.state);
    });

    $scope.$on('clicked::month', function (event, args) {
        // console.log('clicked::month');

        if(isMessageFormShown()) {
            $scope.state.isFormShown = false;
        }

        if(isCurrentMonthClicked(args.month) && isContextMenuShown()) {
            hideContextMenu($scope.state.ctxMenuRef);
        }
        
        else if(!isCurrentMonthClicked(args.month) && isContextMenuShown()) {
            selectMonthAsync(args.month);
            hideContextMenu();
        }

        else {
            selectMonthAsync(args.month);
        }

    });

    $scope.$on('clicked::item', function (event, args) {
        console.log('clicked::item');
        $scope.state.itemRef = args.item;
        let dayNum = MyDates.getDateFromString(args.item.dayCode);
        $scope.state.weekRef = setWeekRef(dayNum);
        $scope.state.dayRef = setDayRef(dayNum);
        // $scope.view.calendarView.update();

        $scope.state.isFormShown = true;
        // $scope.view.expensePoster.update();

        hideContextMenu($scope.state.ctxMenuRef);
        
        $scope.$apply(function(){
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
        if(isContextMenuShown()){
            hideContextMenu($scope.state.ctxMenuRef);
        }
        $scope.state.dayRef = args.day;
        $scope.state.itemRef = undefined;
        $scope.state.weekRef = setWeekRef($scope.state.dayRef.dayNum);
        if($scope.state.isFormShown === true) {
            $scope.state.isFormShown = false;
        }
        $scope.view.calendarView.update();
        $scope.view.expensePoster.update();

        $timeout(function () {
            if(clicks.length === 1){
                // var newDay = $scope.state.monthRef.monthString + MyDates.dayToString(args.day.dayNum);
                // $scope.state.itemRef = undefined;
                // $scope.state.weekRef = setWeekRef($scope.state.dayRef.dayNum);

                // if($scope.state.isFormShown === true) {
                //     $scope.state.isFormShown = false;
                // }
                // $scope.view.calendarView.update();
                // $scope.view.expensePoster.update();
            }
            else if(clicks.length >= 2) {
                $scope.$emit('dblclicked::day', {day: args.day})
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
        var item = new UIItem(1, 0, "New item", day.timeWindow, {isPlan: isFuture, isDeleted: false}, false);
        $scope.state.itemRef = item;
        day.addItem(item);
        $scope.$apply(function(){
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
        if($scope.state.itemRef === args.item) {
            $scope.state.isFormShown = true;
            $scope.view.expensePoster.update();
        }
    });

    $scope.$on('clicked::item::btn', function(event, args){

        var pushCallback = function(pushData) {
            // - read dayCode from push
            // - trigger http get for the dayCode
            // - all items arrived from http call will have status 'isSaved'
            // console.log(pushData);
            console.log(`pushCallback on ${pushData}`);
            let dayNum = MyDates.getDateFromString(pushData);
            let week = setWeekRef(dayNum);
            let day = week.getDayRef(pushData);
            $http.get(day.getUrl)
                .then(function(res){
                    let items = res.data;
                    let result =  [];
                    items.forEach(function(item){
                        let transformedItem = UIItem.transformToUIItem(item);
                        transformedItem.isItemProcessing = false;
                        transformedItem.isSaved = true;
                        result.push(transformedItem);
                    });
                    $scope.$applyAsync(function(){
                        day.html.items = result;
                        day.update();
                    });
                });
        };

        // @function: executed after updateData from server has arrived. Updates target object with updateData;
        // @param: Array [Object] updateData - the result of async http call to server.
        // @param: Object target - the object, that has to be updated with updateData
        // @return: void
        var saveCallback = function(response) {
            console.log(`saveCallback on ${response.data._id}`);
            $scope.state.itemRef.setItemFromForm(args.form);
            $scope.state.itemRef.isItemProcessing = true;
            $scope.state.itemRef.isSaved = false;
            $scope.state.isFormShown = false;
            $scope.view.calendarView.update();
            $scope.view.expensePoster.update();
            // $scope.state.monthRef.update();
            // - change item amount and description to user input
            // - close form

        };

        // This process is async
        // This process changes state
        // This process relies on data in event to be done.
        // start: user click button in directive -> 'clicked::item::btn' fires
        // then: we connect to push socket and register message push arrival handler (set item to 'saved' state)
        // then: we post message to api.message
        // then: after api reply (message post status) has arrived we execute callback, which have to
        // - close form
        // - set item to 'processing state'
        // - change item amount and description to user input
        // - update the monthSwitch with date from server
        //
        // const PusherClient = require('../../common/PusherClient');
        // const guid = require('../../common/guid');
        var token = guid();
        // $scope.pushListener = new PusherClient(token, pushCallback); // -> set change of state when push arrives

        $scope.pushListener.register(token, pushCallback);
        var message = args.form.assembleMessage(args.btn, token);
        $http.post(args.form.postUrl, message)
            .then(saveCallback);

    });

    $scope.$on('clicked::ctxMenu', function(event, args) {

        if(isContextMenuShown() && !isContextMenuOfCurrentMonthClicked()) {
            hideContextMenu();
            selectMonthAsync(args.ctxMenu.target);
            showContextMenu(args.ctxMenu);
        }

        if(isContextMenuShown() && isContextMenuOfCurrentMonthClicked()) {
            hideContextMenu();
        }

        if(!isContextMenuShown()) {
            selectMonthAsync(args.ctxMenu.target);
            showContextMenu(args.ctxMenu);
        }
    });

    $scope.$on('clicked::ctxMenu::option', function(event, args){
        if(isCopyOption(args.option)) {
            sendCommandAsync(args.option, copyCommandCallback);
            $scope.state.isCommandProcessing = true;
        }

        if(isClearOption(args.option)) {
            sendCommandAsync(args.option, clearCommandCallback);

        }
    });

};