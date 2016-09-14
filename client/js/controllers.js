exports.pfinAppCtrl = function ($scope, $views, $user, $timeout, $http) {
    var MyDates = require('../../common/MyDates');
    var UIItem = require('../../common/UIItem');

    $scope.state = {
        init: {
            month: MyDates.dateToString(new Date(), {y:1, m:1, d: undefined}),
            week: MyDates.numberOfWeek(new Date()),
            day: MyDates.dateToString(new Date())
        },
        monthRef: undefined,
        weekRef: undefined,
        dayRef: undefined,
        itemRef: undefined,
        isFormShown: false,
        payloadType: 1,
        sortParam: "occuredAt",
        sortOrder: -1,
        updatedDays:[],
        updatedMonths:[],
        user: {}
    };

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
        // console.log(`dayCode is ${dayCode}`);

        if(dayNum > MyDates.daysInMonth($scope.state.monthRef.monthString)) {
            dayNum = MyDates.daysInMonth($scope.state.monthRef.monthString);
        }
        var dayCode = $scope.state.monthRef.monthString + MyDates.dayToString(dayNum);
        // console.log(`dayCode is ${dayCode}`);
        var newWeek = getWeekForDay(dayCode);
        // console.log(`new week = ${newWeek}`);
        return $scope.view.calendarView.weeks[newWeek];
    };

    var setDayRef = function(dayCode){
        dayCode = $scope.state.monthRef.monthString + MyDates.dayToString(dayCode);
        return $scope.state.weekRef.getDayRef(dayCode);
    };

    var getDaysAsync = function() {
        var days = $scope.view.calendarView.getFlatDays();
        console.log(days);
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
            $scope.view.initCalendarView($scope.state);
            getDaysAsync();
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
        console.log('clicked::month');
        $scope.state.monthRef.html.isSelected = false;
        $scope.state.monthRef = args.month;
        $scope.state.monthRef.html.isSelected = true;
        // if(args.index === 0 || args.index === 5) {
        //     var newMonths = MyDates.headingsArray(MyDates.neighbours($scope.state.monthRef.monthString, [-2, 3]),'');
        //     $scope.state.updatedMonths = newMonths;
        // }

        $scope.view.initCalendarView();
        var dayCode = getDayCode();
        // console.log(`dayCode = ${dayCode}`);
        $scope.state.weekRef = setWeekRef(dayCode);
        $scope.state.dayRef = setDayRef(dayCode);

        if($scope.state.isFormShown === true) {
            $scope.state.isFormShown = false;
        }
        $scope.view.calendarView.update();
        // console.log($scope.state);
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
        $scope.state.dayRef = args.day;

        $timeout(function () {
            if(clicks.length === 1){
                // var newDay = $scope.state.monthRef.monthString + MyDates.dayToString(args.day.dayNum);
                $scope.state.itemRef = undefined;
                $scope.state.weekRef = setWeekRef($scope.state.dayRef.dayNum);

                if($scope.state.isFormShown === true) {
                    $scope.state.isFormShown = false;
                }
                $scope.view.calendarView.update();
                $scope.view.expensePoster.update();
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
            console.log(`pushCallback on ${pushData.dayCode}`);
            let dayNum = MyDates.getDateFromString(pushData.dayCode);
            let week = setWeekRef(dayNum);
            let day = week.getDayRef(pushData.dayCode);
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
        const PusherClient = require('../../common/PusherClient');
        const guid = require('../../common/guid');
        var token = guid();
        $scope.pushListener = new PusherClient(token, pushCallback); // -> set change of state when push arrives
        var message = args.form.assembleMessage(args.btn, token);
        $http.post(args.form.postUrl, message)
            .then(saveCallback);

    });

};