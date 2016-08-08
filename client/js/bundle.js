(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by py on 23/07/16.
 */

var AppView;

var MonthSwitch = require('../../common/MonthSwitch');
var Calendar = require('../../common/Calendar');
var Dashboard = require('../../common/Dashboard');
var MessagePoster = require('../../common/MessagePoster');
var PusherClient = require('../../common/PusherClient');

AppView = function(httpService) {

    var Shared = require('../../common/Shared');
    Shared.change("http", httpService);
    var state = Shared.getInstance().state;

    this.state = state;

    this.monthSwitchView = new MonthSwitch(state);
    this.calendarView = new Calendar(state);
    this.dashboardView = new Dashboard(state);
    this.expensePoster = new MessagePoster(state);

    this.update = function(state) {
        this.monthSwitchView.update(state);
        this.calendarView.update(state);
        this.dashboardView.update(state);
        this.expensePoster.update(state);
        console.log(this);
    };

    var self = this;
    // param: Object data - arbitrary object received by PusherClient
    // function: request update for all data in views
    // return: void
    var messageScoredCallback = function (data) {
        self.update(state);
    };
    PusherClient.subscribe("message", "message::scored", messageScoredCallback);

    this.update(state);
};

module.exports = AppView;
},{"../../common/Calendar":6,"../../common/Dashboard":7,"../../common/MessagePoster":12,"../../common/MonthSwitch":14,"../../common/PusherClient":16,"../../common/Shared":17}],2:[function(require,module,exports){
var controllers = require( './controllers.js' );
var directives = require( './directives.js' );
var services = require( './services.js' );
var _ = require( 'underscore' );

var components = angular.module( 'personalFinance.components', ['ng']);

_.each( controllers, function( controller, name ) {
    components.controller( name, controller );
});

_.each( directives, function( directive, name ) {
    components.directive( name, directive );
});

_.each( services, function( factory, name ) {
    components.factory( name, factory );
});

var client = angular.module( 'personalFinance', [ 'personalFinance.components', 'ngRoute']);

client.config( function( $routeProvider ){

    $routeProvider.
        when ('/', {
        templateUrl: 'assets/templates/main.html'
    }).
    when ('/calendar', {
        templateUrl: 'assets/templates/logAndPlanApp.html'
    });

});
},{"./controllers.js":3,"./directives.js":4,"./services.js":5,"underscore":21}],3:[function(require,module,exports){
exports.pfinAppCtrl = function ($scope, $views, $user) {
    var Shared = require('../../common/Shared');
    var MyDates = require('../../common/MyDates');
    var state = Shared.getInstance().state;

    $scope.user = $user.user;
    $scope.$watch('user', function (newVal, oldVal) {
        Shared.change("user", newVal);
    });

    $scope.view = $views.initAppView();

    $scope.$watch('view.state.isUpdated', function (newVal, oldVal) {
        if(newVal === true) {
            $scope.view.update(state);
            Shared.change('isUpdated', false);
        }
    });

    // param: String newDay - the day in string format "YYYYMMDD" for which we want to get week number (from 0 to 3-5)
    // function: calculate the number of week, where given day belongs to.
    // return: int weekNum
    var getWeekForDay = function(newDay) {
        var y = MyDates.getYearFromString(newDay);
        var m = MyDates.getMonthFromString(newDay);
        var d = MyDates.getDateFromString(newDay);
        var date = new Date(y, m - 1, d);
        return MyDates.numberOfWeek(date);
    };

    $scope.$on('update::month', function (event, args) {
        var newDay, newWeek;

        if(args.newMonth !== undefined) {
            Shared.change('currentMonth', args.newMonth);

            newDay = MyDates.getDateFromString(state.currentDay);
            if(newDay > MyDates.daysInMonth(state.currentMonth)) {
                newDay = MyDates.daysInMonth(state.currentMonth);
            }
            newDay = state.currentMonth + MyDates.dayToString(newDay);
            Shared.change('currentDay', newDay);

            newWeek = getWeekForDay(newDay);
            Shared.change('currentWeek', newWeek);
        }

        if(args.newWeek !== undefined) {

            newDay = MyDates.getDateFromString(state.currentDay);
            newDay = Number(newDay) + 7 * (args.newWeek - state.currentWeek);
            if(newDay > MyDates.daysInMonth(state.currentMonth)) {
                newDay = MyDates.daysInMonth(state.currentMonth);
            }
            else if(newDay < 1) {
                newDay = 1;
            }
            newDay = state.currentMonth + MyDates.dayToString(newDay);
            Shared.change('currentDay', newDay);
            Shared.change('currentWeek', args.newWeek);
        }

        $scope.view.update(state);
    });

    $scope.$on('update::item', function (event, args) {
        Shared.change('currentItem', args.currentItem);
        Shared.change('currentDay', args.currentItem.dayCode);
        Shared.change('currentWeek', getWeekForDay(args.currentItem.dayCode));
        $scope.view.update(state);
    });

    $scope.$on('update::day', function (event, args) {
        var newDay = state.currentMonth + MyDates.dayToString(args.newDay);
        Shared.change('currentItem', undefined);
        Shared.change('currentDay', newDay);
        Shared.change('currentWeek', getWeekForDay(newDay));
        $scope.view.update(state);
    });

    $user.getUser(function success(){
        $scope.user = $user.user;
    });
};
},{"../../common/MyDates":15,"../../common/Shared":17}],4:[function(require,module,exports){
exports.monthSwitchView = function () {
    return {
        scope: {
            self: "=extMonthSwitchView"
        },
        templateUrl: "/assets/templates/monthSwitch.html",
        link: function (scope, el, attr, ctrl) {
            el.on('click', function(event){
                event.target.blur(); // -> remove blue frame (focus) from btn after click
            });
        }
    }
};

exports.progress = function() {
    return {
        replace: true,
        scope: {
            self: "=extProgress"
        },
        templateUrl: "/assets/templates/progress.html",
        link: function(scope, el, attr, ctrl) {
        }
    }
};

exports.calendar = function () {
    return {
        scope:{
            self:"=extCalendar"
        },
        templateUrl: "/assets/templates/calendar.html",
        link: function (scope, el, attr, ctrl) {
        }
    }
};

exports.week = function () {
    return {
        scope:{
            self:"=extWeek"
        },
        templateUrl: "/assets/templates/week.html",
        link: function (scope, el, attr, ctrl) {

        }
    }
};

exports.day = function () {
    return {
        scope:{
            self:"=extDay"
        },
        templateUrl: "/assets/templates/day.html",
        link: function (scope, el, attr, ctrl) {
            el.on('click', function (event) {
                event.stopImmediatePropagation();
                scope.$emit('update::day', {newDay: scope.self.dayNum});
            })
        }
    }
};

exports.messageForm = function() {
    return {
        scope: {
            self: "=extMessage"
        },
        templateUrl: "/assets/templates/messageForm.html",
        link: function (scope, el, attr, ctrl) {

        }
    }
};
exports.item = function() {
    return {
        scope: {
            self: "=extItem"
        },
        templateUrl: "/assets/templates/item.html",
        link: function (scope, el, attr, ctrl) {

            // this handler selects clicked item
            el.on('click', function (event) {
                event.stopImmediatePropagation();
                scope.self.boundingClientRect = el[0].getBoundingClientRect();
                scope.$emit('update::item', {currentItem: scope.self});
            })
        }
    }
};

},{}],5:[function(require,module,exports){
var status = require( 'http-status' );

// $views service returns AppView model
exports.$views = function($http) {

    var AppView = require( './AppView.js' );

    var s = {};

    var appView = new AppView($http);

    s.initAppView = function() {
        return appView;
    };

    return s;
};

exports.$user = function( $http ) {
    var s = {user:{}};
    s.getUser = function(callback) {
        $http.
        get('/api/v1/me').
        success( function( data ) {
            s.user = data.user;
            callback();
        }).
        error( function( data, status ) {
            if( status === status.UNAUTHORIZED ) {
                s.user = null;
            }
        });
    };
    return s;
};
},{"./AppView.js":1,"http-status":20}],6:[function(require,module,exports){
/**
 * Created by py on 24/07/16.
 */

var Calendar;

var MyDates = require('./MyDates');
var Week = require('./Week');

// param: Object state
// function: object constructor
// return: Calendar object
Calendar = function(state) {

    var self = this;
    // param: Object state
    // function: init the object. Set up storage for weeks, construct Weeks.
    // return: void
    var init = function (state) {
        self.weeks = [];
        self.dayNames = [
            [null, "Sun", "Mon"],
            ["Tue", "Wed", "Thu"],
            ["Fri", "Sat", null]
        ];
        self.monthString = state.currentMonth;
        var numOfWeeks = MyDates.weeksInMonth(self.monthString);
        for(var i = 0; i < numOfWeeks; i++){
            self.weeks.push(new Week(i, self.monthString, state, true));
        }
    };

    // param: String t - string representation of TimeWindow object
    // function: decide, whether Calendar should be rebuilt (month changed)
    // return: Bool decision
    var isRenewCalendar = function(t) {
        var decision = false;
        if(t !== self.monthString){
            decision = true;
        }
        return decision;
    };

    var update = function(state){
        for(var i = 0; i < self.weeks.length; i++) {
            self.weeks[i].update(state);
        }
    };

    this.update = function(state) {
        if(isRenewCalendar(state.currentMonth)) {
            init(state);
            update(state);
        }
        else {
            update(state);
        }
    };

    // MAIN LOOP
    init(state);

};

module.exports = Calendar;
},{"./MyDates":15,"./Week":19}],7:[function(require,module,exports){
/**
 * Created by py on 24/07/16.
 */

var Dashboard;

Dashboard = function (state) {

    this.update = function(state){

    };

};

module.exports = Dashboard;
},{}],8:[function(require,module,exports){
/**
 * Created by py on 25/07/16.
 */

var Day;

var Shared = require('./Shared');
var MyDates = require('./MyDates');

// param: int dayNum - the day number in month (from 1 to 28-31)
// param: int weekNum - the week number, where Day belongs to
// param: String month - the string-encoded TimeWindow, which is on month level.
// Formatted as "YYYYMM".
// param: Object state
// function: object constructor
// return: Day object
Day = function (dayNum, weekNum, month, state) {
    var self = this;

    // param: int dayNum - the day number in month (from 1 to 28-31)
    // param: int weekNum - the number of week in month (from 0 to 3-5), where day belongs to.
    // param: String month - the string-encoded TimeWindow, which is on month level.
    // Formatted as "YYYYMM".
    // param: Object state
    // function: setup static parameters of Day object
    // return: self, so method can be chained.
    self.setUp = function(dayNum, weekNum, month, state) {
        self.dayNum = dayNum;
        self.weekNum = weekNum;
        self.month = month;
        self.timeWindow = self.month + MyDates.dayToString(dayNum);
        self.getUrl = 'api/v1/day/'.concat(self.timeWindow);
        self.needsHttpCall = true;
        return self;
    };

    // param: void, since it is just initialization
    // function: init self.html object, which is exposed to HTML template
    // return: self, so method can be chained.
    self.initHTML = function () {
        self.html = {};
        self.html.isSelected = false;
        self.html.items = [];
        self.html.isInSelectedWeek = false;
        self.html.totalWeeks = MyDates.weeksInMonth(self.month);
        self.html.maxItems = 0;
        self.html.isFuture = false;
        // param: String arg - the name of the property, over which we will sum. E.g. Day['name']
        // param: Array [Object] arr - the array, over which elements we will sum
        // function: calculate the sum of the 'name' property in the array
        // return: int sum
        self.html.sum = function(arg, arr) {
            var s = 0;
            for(var i = 0; i < arr.length; i++) {
                if(typeof arr[i][arg] !== 'number'){
                    throw new Error('property, you want to sum, is not number. Number expected');
                }
                else {
                    s += arr[i][arg];
                }
            }
            return s;
        };

        return self;
    };

    // param: Object state
    // function: decides, whether Day should be shown as 'selected' in HTML. Writes decision to self.html.isSelected
    // return: self, so method can be chained
    self.setIsSelected = function (state) {
        var hitMonth, hitWeek, hitDay;
        self.month === state.currentMonth ? hitMonth = true : hitMonth = false;
        self.weekNum === state.currentWeek ? hitWeek = true : hitWeek = false;
        var day = self.month + MyDates.dayToString(self.dayNum);
        day === state.currentDay ? hitDay = true : hitDay = false;
        self.html.isSelected = hitMonth && hitWeek && hitDay;
        return self;
    };

    // param: Object state
    // function: gets new items for Day object (e.g. Expense items). Makes http call and writes results into self.html.items
    // return: self, so method can be chained
    self.updateItems = function(state) {
        if(self.needsHttpCall) {
            var shared = Shared.getInstance();
            var http = shared.service.http;
            var setValues = shared.fns.setValues;

            http.get(self.getUrl).then(function success (response) {
                var data = response.data;
                for(var i in data){
                    data[i].dayCode = self.timeWindow;
                }
                self.html.items = data;
                self.needsHttpCall = false;
                return self;
            }, function error (response) {
                throw new Error('failed to get data from ' + self.getUrl);
            });
        }
    };

    // param: Object state
    // function: decides, whether Day is in selected week so it should have special width in HTML. Writes decision to self.html.isInSelectedWeek
    // return: self, so method can be chained
    self.setIsInSelectedWeek = function(state) {
        self.weekNum === state.currentWeek ? self.html.isInSelectedWeek = true : self.html.isInSelectedWeek = false;
        return self;
    };

    // param: Bool isInSelectedWeek - flag, that tells if Day is in selected week
    // function: set maximum number of items shown in Day
    // return: self, so method can be chained.
    self.setMaxItems = function (isInSelectedWeek) {
        self.html.maxItems = isInSelectedWeek ? 20 : 0;
        return self;
    };

    // param: String t - timeWindow of the day
    // function: set 'self.html.isFuture' if day is in future.
    // return: self, so method can be chained.
    self.setIsFuture = function(t) {
        var tws = MyDates.stringToTw(t);
        var today = new Date();
        tws.startDate > today ? self.html.isFuture = true : self.html.isFuture = false;
        return self;
    };

    // param: Object state
    // function: change self.html parameters according to 'state'
    // return: void
    self.update = function(state){
        self.setIsInSelectedWeek(state)
            .setIsSelected(state)
            .setMaxItems(self.html.isInSelectedWeek)
            .setIsFuture(self.timeWindow)
            .updateItems(state);
    };

    // MAIN LOOP
    self.setUp(dayNum, weekNum, month, state)
        .initHTML()
        .update(state);
};

module.exports = Day;
},{"./MyDates":15,"./Shared":17}],9:[function(require,module,exports){
/**
 * Created by py on 05/08/16.
 */

var ExpenseMessagePayload;

// param: MessagePayload p - the base MessagePayload object, that we decorate with Expense attributes
// param: int amount - integer > 0 that is Expense amount
// param: String desc - string description of Expense.
// param: String id - optional parameter, id of existing expense.
// function: Object constructor
// return: ExpenseMessagePayload object
ExpenseMessagePayload = function (p, amount, desc, id) {
    // this.messagePayload = p;
    this.dayCode = p.dayCode;
    this.labels = p.labels;

    if(amount === undefined || typeof amount !== 'number' || amount < 0) {
        throw new Error('amount is either undefined, or not number, or less than 0');
    }
    else {
        this.amount = amount;
    }

    if(desc === undefined || typeof desc !== 'string') {
        throw new Error('description is either undefined, or not string');
    }
    else {
        this.description = desc;
    }

    if(id === undefined) {
        this.id = null;
    }
    else {
        this.id = id;
    }
};

module.exports = ExpenseMessagePayload;
},{}],10:[function(require,module,exports){
/**
 * Created by py on 05/08/16.
 */

var Message;

var MyDates = require('../common/MyDates');

// param: String user - id of the user, who posts the Message
// param: int sourceId - code for Message sources. 1 - for WebBrowser
// param: int type - code toe Message Type. 1 - for 'Expense'
// param: ExpenseMessagePayload emp - payload object
// function: constructs Message object
// return: Message object
Message = function(user, sourceId, type, emp) {
    if(user === undefined || typeof user !== 'string') {
        throw new Error('user is either undefined or not String');
    }
    else {
        this.user = user;
    }

    if(sourceId === undefined || typeof sourceId !== 'number') {
        throw new Error('message source id is either undefined, or not integer');
    }
    else {
        this.sourceId = sourceId;

    }

    if(type === undefined || typeof type !== 'number') {
        throw new Error('message type is either undefined or not integer');
    }
    else {
        this.type = type;
    }

    if(emp === undefined){
        throw new Error('payload is either undefined (ExpenseMessagePayload expected)');
    }
    else {
        this.payload = emp;
    }

    this.occuredAt = MyDates.now();
};

module.exports = Message;
},{"../common/MyDates":15}],11:[function(require,module,exports){
/**
 * Created by py on 05/08/16.
 */

var MessagePayload;

// param: String dayCode - formatted string "YYYYMMDD", where this Message is attributed to.
// This is NOT a creation date, or stored date.
// This date is used to show the Message in appropriate Day in Calendar
// param: Object labels - collection of flags {isPlan: false}, {isDeleted: false}.
MessagePayload = function(dayCode, labels) {
    if(dayCode === undefined || typeof dayCode !== 'string' || dayCode.length !== 8) {
        throw new Error('dayCode is either undefined, or not String, or not 8 chars long');
    }
    else {
        this.dayCode = dayCode;
    }
    if(labels.isPlan === undefined || labels.isDeleted === undefined) {
        throw new Error('labels object does not have mandatory key-values (isPlan and isDeleted expected)');
    }
    else {
        this.labels = labels;
    }
};

module.exports = MessagePayload;
},{}],12:[function(require,module,exports){
/**
 * Created by py on 05/08/16.
 */

var MessagePoster;

var MessagePayload = require('../common/MessagePayload');
var ExpenseMessagePayload = require('../common/ExpenseMessagePayload');
var Message = require('../common/Message');
var Shared = require('../common/Shared');
var MyDates = require('../common/MyDates');

// param: Object state
// function: object constructor
// return: MessagePoster object
MessagePoster = function (state) {
    var self = this;

    // param: Object state
    // function: setup static parameters of Day object
    // return: self, so method can be chained.
    self.setUp = function(state) {
        self.dateString = state.currentDay;
        self.dateUTC = 0;
        self.postUrl = 'api/v1/message/'.concat(self.dateString);
        self.currentItemId = undefined;

        return self;
    };

    // param: void, since it is just initialization
    // function: init self.html object, which is exposed to HTML template
    // return: self, so method can be chained.
    self.initHTML = function () {
        self.html = {};
        self.html.isShown = false;
        self.html.amount = {
            placeholder: 'Expense amount',
            value: 0
        };
        self.html.description = {
            placeholder: 'Describe the expense... E.g. "Car. Gas", or "Food. Lunch"',
            value: ''
        };
        self.html.isPlanned = false;
        self.html.isDeleted = false;

        self.html.style = {
            position: 'fixed',
            left: 0,
            top: 0,
            width: 0,
            'z-index': 1
        };
        return self;
    };

    // param: Object state
    // function: decides, whether Form should be shown in HTML. Writes decision to self.html.isShown
    // return: self, so method can be chained
    self.setIsShown = function (state) {
        state.currentItem !== undefined ? self.html.isShown = true : self.html.isShown = false;
        return self;
    };

    // param: Object state
    // function: change the dateSting of the MessagePoster.
    // return: self, so method can be chained.
    self.setDateString = function (state) {
        self.dateString = state.currentDay;
        return self;
    };

    // param: Object state
    // function: set the selected Item from state
    // return: self, so method can be chained.
    self.setSelectedItem = function (state) {
        if(state.currentItem !== undefined) {
            self.currentItemId = state.currentItem._id;
            self.html.amount.value = state.currentItem.amount;
            self.html.description.value = state.currentItem.description;
            self.html.isPlanned = !state.currentItem.labels.isConfirmed;
            self.html.isDeleted = state.currentItem.labels.isDeleted;
        }
        return self;
    };

    // param: Object state
    // function: set the expense poster position to near the clicked item
    // return: self, so method can be chained.
    self.setPopUpStyle = function (state) {
        if(state.currentItem !== undefined) {
            var clickedRect = state.currentItem.boundingClientRect;
            self.html.style.left = clickedRect.left + clickedRect.width;
            self.html.style.top = clickedRect.top - 42;
            self.html.style.width = clickedRect.width * 1.5;
        }
        return self;
    };

    // param: ExpenseData message - the packed ExpenseData object to be sent over http to server
    // function: posts message to server. If succeed, changes self.postSuccess to true. It will tell pfinAppCtrl to
    // trigger the update event and AppView will be updated.
    // Throws error, if failed to do so.
    // return: void
    self.save = function(message) {
        var shared = Shared.getInstance();
        var http = shared.service.http;
        var state = Shared.getInstance().state;

        http.post(self.postUrl, message).then(function success (response){
            console.log(response.data);
            Shared.change('currentItem', undefined);
        }, function error (response){
            throw new Error('failed to post message to ' + self.postUrl);
        });
    };

    // param: void
    // function: assemble expected ExpenseData from 'self'
    // return: Message
    self.assembleMessage = function() {
        var dayCode = self.dateString;
        var p = new MessagePayload(
            dayCode,
            {
            isPlan: self.html.isPlanned,
            isDeleted: self.html.isDeleted
            }
        );
        var emp = new ExpenseMessagePayload(p, self.html.amount.value, self.html.description.value, self.currentItemId);
        var user = Shared.getInstance().user;
        return new Message(user._id, 1, 1, emp);

    };

    // param: String btn - name of the clicked button
    // function: handle btn click in the form - assemble Message and send it over the http to save into DB.
    // return: void
    self.handleClick = function (btn) {
        var message;
        if(btn === 'delete') {
            self.html.isDeleted = true;
        }
        message = self.assembleMessage();
        self.save(message);
    };

    // param: Object state
    // function: change self.html parameters according to 'state'
    // return: void
    self.update = function(state){
        self.initHTML()
            .setIsShown(state)
            .setDateString(state)
            .setSelectedItem(state)
            .setPopUpStyle(state);
    };

    // MAIN LOOP
    self.setUp(state)
        .update(state);
};

module.exports = MessagePoster;
},{"../common/ExpenseMessagePayload":9,"../common/Message":10,"../common/MessagePayload":11,"../common/MyDates":15,"../common/Shared":17}],13:[function(require,module,exports){
/**
 * Created by py on 24/07/16.
 */

var Month;

var TimeWindow = require('./TimeWindow');
var Shared = require('./Shared');
var MyDates = require('./MyDates');

// param: String t - string representation of timeWindow object
// param: Object state
// function: object constructor
// return: Month object
Month = function (t, state) {
    var self = this;

    // param: String month - the string-encoded TimeWindow, which is on month level.
    // Formatted as "YYYYMM".
    // param: Object state
    // function: setup static parameters of Month object
    // return: self, so method can be chained.
    self.setUp = function(t, state) {
        self.monthString = t;
        self.getUrl = 'api/v1/month/'.concat(t);
        self.needsHttpCall = true;
        return self;
    };


    // param: void, since it is just initialization
    // function: init self.html object, which is exposed to HTML template
    // return: self, so method can be chained.
    self.initHTML = function () {
        self.html = {};
        self.html.totals = {
            plan: 0,
            fact: 0
        };
        self.html.isSelected = false;
        self.html.all = function () {
            return self.html.totals.fact + self.html.totals.plan;
        };
        self.html.formattedMonth = MyDates.monthAsLabel(self.monthString, false);
        self.html.style = {plan:{},fact:{}};
        return self;
    };

    // param: Object state
    // function: decides, whether Month should be shown as 'selected' in HTML. Writes decision to self.html.isSelected
    // return: self, so method can be chained
    self.setIsSelected = function (state) {
        if(state.currentMonth !== undefined){
            self.monthString === state.currentMonth ? self.html.isSelected = true : self.html.isSelected = false;
        }
        return self;
    };

    // param: Object state
    // function: get Month data over http, if month update is needed.
    // return: self, so method can be chained.
    self.updateTotals = function(state) {
        var shared = Shared.getInstance();
        var http = shared.service.http;
        var setValues = shared.fns.setValues;

        http.get(this.getUrl).then(function success(response){
            setValues(response, self.html);
            var all = function () {
                return self.html.totals.fact + self.html.totals.plan;
            };
            if(self.html.totals.plan === 0 && self.html.totals.fact === 0) {
                self.html.style.plan = {width: '50%'};
                self.html.style.fact = {width: '50%'};
            }
            else {
                self.html.style.plan = {width: Math.floor(100 * self.html.totals.plan/ all()) + '%'};
                self.html.style.fact = {width: Math.ceil(100 * self.html.totals.fact/ all()) + '%'};
            }
        }, function error(response) {
            throw new Error('failed to get data from ' + self.getUrl);
        });
    };

    // param: Object state
    // function: change self.html parameters according to 'state'
    // return: self, so method can be chained
    self.update = function (state) {
        self.setIsSelected(state)
            .updateTotals(state);
        return self;
    };

    // MAIN LOOP
    self.setUp(t, state)
        .initHTML()
        .update(state);
};


module.exports = Month;
},{"./MyDates":15,"./Shared":17,"./TimeWindow":18}],14:[function(require,module,exports){
/**
 * Created by py on 24/07/16.
 */

var MonthSwitch;

var Month = require('./Month');
var MyDates = require('./MyDates');

// param: Object state
// function: object constructor
// return: MonthSwitch object
MonthSwitch = function(state) {

    var self = this;

    // param: Object state
    // function: constructs the array of 6 Months: 1 back, current, 4 forward.
    // return: void
    var init = function(state) {
        self.months = [];
        var months = MyDates.headingsArray(MyDates.neighbours(state.currentMonth, [-2, 3]),'');
        for(var i = 0; i < months.length; i++) {
            self.months.unshift(new Month(months[i], state));
        }
    };

    // param: String t - current time window from state object
    // function: decide, whether or not to renew the months in MonthSwitch
    // return: Bool result
    var isRenewSwitch = function(t) {
        var result = false;
        var last = self.months.length - 1;
        if(t === self.months[0].monthString || t === self.months[last].monthString) {
            result = true;
        }
        return result;
    };

    var update = function(state){
        for(var i = 0; i < self.months.length; i++) {
            self.months[i].isSelected = false;
            self.months[i].update(state);
        }
    };

    this.update = function(state) {
        if(isRenewSwitch(state.currentMonth)) {
            init(state);
            update(state);
        }
        else {
            update(state);
        }
    };

    // MAIN LOOP
    init(state);
};

module.exports = MonthSwitch;
},{"./Month":13,"./MyDates":15}],15:[function(require,module,exports){
/**
 * Created by py on 23/07/16.
 */

var MyDates;

var TimeWindow = require('../common/TimeWindow');

MyDates = (function() {

    // param: String string - string representation of timeWindow
    // function: extract exact date (1-31) from timeWindow
    // return: Number date
    var getDate = function(string) {
        if(string.length === 8){
            return Number(string.substring(6,8));
        }
        else {
            return null;
        }
    };

    // param: String string - string representation of timeWindow
    // function: extract Month from timeWindow
    // return: String month
    var getMonth = function(string) {
        if(string.length >=  6) {
            return Number(string.substring(4,6));
        }
        else {
            return null;
        }
    };

    // param: String string - string representation of timeWindow
    // function: extract Year from timeWindow
    // return: String year
    var getYear = function(string) {
        if(string.length >= 4) {
            return Number(string.substring(0, 4));
        }
        else {
            return null;
        }
    };

    // param: String sting - formatted TimeWindow string in "YYYYMM" or "YYYYMMDD" expected.
    // function: calculate number of days in given month
    // return: integer
    var daysInMonth = function(string) {
        var number = 30;
        var month = getMonth(string);
        var year = getYear(string);

        if(month <= 7) {
            if(month % 2 === 1) {
                number = 31;
            }
            else if(month % 2 === 0) {
                if(year % 4 === 0 && month === 2) {
                    number = 29;
                }
                else if (year % 4 !== 0 && month === 2){
                    number = 28;
                }
                else if(year % 4 !== 0 && month !== 2) {
                    number = 30
                }
            }
        }
        else if(month > 7) {
            if(month % 2 === 0) {
                number = 31
            }
        }

        return number;
    };

    // param: String t - string representation of TimeWindow object. "YYYYMM" format expected.
    // function: find out, how many weeks in given month-year.
    // return: int numberOfWeeks
    var weeksInMonth = function(t) {
        var weeks = 1;
        var firstDay = firstDayOfMonth(t);
        var daysInFirstWeek = 7 - firstDay;
        var fullWeeksInMonth = Math.floor((daysInMonth(t) - daysInFirstWeek)/7);
        var lastWeek = (daysInMonth(t) - daysInFirstWeek)%7 === 0 ? 0 : 1;
        return weeks + fullWeeksInMonth +lastWeek;

    };

    // param: String t - string representation of TimeWindow object
    // function: find out the first dat of the month
    // return: int firstDay
    var firstDayOfMonth = function(t){
        var tw = stringToTimeWindow(t);
        var firstDayAsDate = new Date(tw.year, tw.month - 1, 1);
        return firstDayAsDate.getDay();
    };

    // param: Date object
    // param: Object def - def vector, showing, what format of the TimeWindowString we need as result.
    // def has format {y: 1, m: 1, d: undefined} (this means, we want to convert date to YYYYMM string only.
    // if no 'def' is provided to function, it will consider YYYYMMDD as resulting string format.
    // function: parse date object and return it's TimeWindow string representation
    // return: String t
    var dateToTimeWindowString = function(date, def){
        if(!def) {
            def = {y:1, m:1, d: 1};
        }
        var t;
        var tw = new TimeWindow({
            year: date.getFullYear() * def.y,
            month: (date.getMonth() + 1) * def.m,
            day: date.getDate() * def.d
        });

        return timeWindowToFormattedString(tw, '');
    };

    // param: String string
    // function: convert string of allowed format to TimeWindow object
    // return: TimeWindow object
    function stringToTimeWindow (string) {
        var t;
        var allowedLengths = [0, 4, 6, 8];
        var isAllowedLength = function(element, index, array) {
            return element === string.length;
        };
        if(!allowedLengths.some(isAllowedLength)) {
            throw new Error('TimeWindow string must be 4,6 or 8 chars length');
        }
        else {
            if(string.slice(0,4) === "0000") {
                return new TimeWindow();
            }
            var year = string.slice(0,4);
            var month = string.slice(4,6);
            var day = string.slice(6,8);
            t = new TimeWindow().set({year: Number(year), month: Number(month), day: Number(day)});
            return t;
        }
    }

    // param: TimeWindow t
    // param: String s - symbol to separate 'year', 'month'' and 'day' in formatted timeWindow
    // function: format TimeWindow object to String, where 'year', 'monht' and 'day' are separated by s
    // if you omit 's', you'll get String representation of TimeWindow, used in api calls.
    // return: String
    var timeWindowToFormattedString = function(t, s) {
        if(t.year) {
            var year = t.year.toString();
        }

        if(t.month) {
            var month = t.month.toString();
            if (month.length < 2) {
                month = "0" + month;
            }
        }
        if(t.day) {
            var day = t.day.toString();
            if(day.length < 2) {
                day = "0" + day;
            }
        }
        if(!t.year) {
            return "0000";
        }
        else if(!t.month) {
            return year;
        }
        else if(!t.day){
            // return month + s + year;
            return year + s + month;
        }
        else {
            // return day + s + month + s + year;
            return year + s + month + s + day;
        }
    };

    // param: Array [TimeWindow] arr
    // param: String s - formatter
    // function: convert array of TimeWindows as heading Strings
    // return: Array [String] - array of strings, formatted with formatter separator.
    function headingsArray (arr, s) {
        var result = [];
        for(var i in arr) {
            result.push(timeWindowToFormattedString(arr[i], s));
        }
        return result;
    }

    // param: String t - timeWindow string representation
    // param: Array [int] range - the range of items to be delivered. Index 0 - is current.
    // Must contain only 2 items. [-1,1] means I want to explode t to three timeWindows:
    // -1 tw from current, current tw and +1 tw from current
    // function: convert TimeWindow to array of embedded TimeWindows.
    // return: Array [TimeWindow]
    var explode = function(t, range){
        var result = [];

        var today = new Date();

        var todayYear = today.getFullYear();

        var todayMonth = today.getMonth();

        var todayDate = today.getDate();

        var timeWindow = stringToTimeWindow(t);

        if(!timeWindow.year) {
            for (var y = range[1]; y >= range[0]; y --){
                var tw = new TimeWindow().set({year: todayYear + y});
                result.push(tw);
            }
        }
        else if(timeWindow.year && !timeWindow.month) {
            for(var m = range[1]; m >= range[0]; m--) {
                result.push(new TimeWindow().set({year: timeWindow.year, month: todayMonth + m}));
            }
        }
        else if(timeWindow.month && !timeWindow.day) {
            for(var d = range[1]; d >= range[0]; d--) {
                result.push(new TimeWindow().set({year: timeWindow.year, month: timeWindow.month, day: todayDate + d}));
            }
        }
        else if(timeWindow.day) {
            throw new Error('TimeWindows with "day" property can not be exploded');
        }

        return result;
    };

    // param: String t
    // function: find the dimension of lower level, in which to explode
    // return: int level
    var explosionIndex = function(t) {
        var index = {y: 0, m: 0, d: 0};
        if(t === "0000") {
            index = {y: 1, m: 0, d: 0};
        }
        else if(t !== "0000" && t.length === 4) {
            index = {y: 0, m: 1, d: 0};
        }
        else if(t !== "0000" && t.length === 6) {
            index = {y: 0, m: 0, d: 1};
        }
        else {
            throw new Error('Unexpected length of TimeWindow (4 or 6 expected)');
        }
        return index;
    };

    var definitiveIndex = function(t) {
        var index = {y: undefined, m: undefined, d: undefined};
        if(t === "0000") {
            index.y = 1;
        }
        else if(t !== "0000" && t.length === 4) {
            index.y = 1;
            index.m = 1;
        }
        else if(t !== "0000" && t.length === 6) {
            index.y = 1;
            index.m = 1;
            index.d = 1;
        }
        else {
            throw new Error('Unexpected length of TimeWindow (4 or 6 expected)');
        }
        return index;
    };

    // param: String t - timeWindow string representation
    // param: Array [int] range - the range of items to be delivered. Index 0 - is current.
    // param: String start - timeWindow, which is zero point in array.
    // Must contain only 2 items. [-1,1] means I want to explode t to three timeWindows:
    // -1 tw from start, current tw and +1 tw from start
    // function: convert TimeWindow to array of embedded TimeWindows.
    // return: Array [TimeWindow]
    var explode2 = function(t, range, start) {
        var result = [];
        var zero = {}; // ->  TimeWindow from which startDate we will iterate back anf forth
        var k = explosionIndex(t); // -> explosion index vector
        var def = definitiveIndex(t); // -> index, showing what is defined and what it not in result of explosion
        if(!start) {
            var today = new Date();
            zero = new TimeWindow().set({
                year: today.getFullYear() * def.y,
                month: (today.getMonth() + 1) * def.m,
                day: today.getDate() * def.d
            });
        }
        else {
            zero = stringToTimeWindow(start);
        }
        for(var i = range[1]; i >= range[0]; i--) {
            var newDate = new Date(zero.startDate.getFullYear() + k.y * i, zero.startDate.getMonth() + k.m * i, zero.startDate.getDate() + k.d * i);
            result.push(new TimeWindow().set({
                year: newDate.getFullYear() * def.y,
                month: (newDate.getMonth() + 1) * def.m,
                day: newDate.getDate() * def.d
            }));
        }
        return result;
    };

    // param: String string - timeWindow string representation
    // function: get the length of parent timeWindow string
    // return: int length - length of parent timeWindow string
    var parentLength = function(string) {
        if(string.length === 4) {
            return 4;
        }
        if(string.length === 6) {
            return 4;
        }
        if(string.length === 8) {
            return 6;
        }
    };

    // param: String string - timeWindow string representation
    // function: parse timeWindow and return it's parent as string
    // return: String - parent timeWindow string representation
    var getParent = function(string) {
        if(string === "0000") {
            return null
        }
        else if(string.length === 4 && string !== "0000") {
            return "0000";
        }
        else {
            return string.slice(0, parentLength(string));
        }
    };

    // param: String t - timeWindow string representation
    // param: Array [int] range - the range of items to be delivered. Index 0 - is current.
    // Must contain only 2 items. [-1,1] means I want three neighbours of t:
    // -1 tw from current, current tw and +1 tw from current
    // function: constructs the array of several Months: range[0] back, current, range[1] forward.
    // return: Array [TimeWindow]
    var getNeighbours = function (t, range) {
        var result = [];
        var parent = getParent(t);
        result = explode2(parent, range, t);
        return result;
    };

    // param: int dayNum
    // function: make char string out of integer
    // return: String day
    var dayToString = function(dayNum){
        var day;
        if(dayNum > 0 && dayNum <= 9){
            day = "0" + dayNum.toString();
        }
        else if(dayNum > 9) {
            day = dayNum.toString();
        }
        return day;
    };

    // param: Date date - date object
    // function: calculate the week number in month, that is encoded in given Date object (from 0 to 3-5)
    // return: int result
    var numberOfWeek = function(date) {
        var result = null;
        var tws = dateToTimeWindowString(date, {y: 1, m: 1, d: undefined}); // -> this is currentMonth, encoded with string
        // var days = daysInMonth(tws); // -> int number of days in month
        var fday = firstDayOfMonth(tws); // -> int first day of month
        var today = getDate(dateToTimeWindowString(date, {y: 1, m: 1, d: 1})); // -> int today date
        return Math.floor((today + fday - 1)/7);

    };

    // param: void
    // function: shorten and unify the DateTime format used for precise timing
    // return: int datetime value in milliseconds
    var nowInMilliseconds = function() {
        return Date.parse(new Date());
    };

    var monthAsLabel = function(t, isLong) {

        var tw = stringToTimeWindow(t);

        if(tw.year && tw.month && !tw.day) {
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var longMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var year = tw.year.toString().slice(2);
            var month;
            if(isLong) {
                month = longMonthNames[tw.month - 1];
            }
            else {
                month = monthNames[tw.month - 1];
            }
            return month + '-' + year;
        }
        else if(tw.year && tw.month && tw.day) {
            throw new Error('this function works only for TimeWindows on month level');
        }
    };

    return {
        daysInMonth: daysInMonth,
        weeksInMonth: weeksInMonth,
        firstDay: firstDayOfMonth,
        dateToString: dateToTimeWindowString,
        getYearFromString: getYear,
        getMonthFromString: getMonth,
        getDateFromString: getDate,
        twToString: timeWindowToFormattedString,
        stringToTw: stringToTimeWindow,
        explode: explode2,
        headingsArray: headingsArray,
        parent: getParent,
        neighbours: getNeighbours,
        dayToString: dayToString,
        numberOfWeek: numberOfWeek,
        now: nowInMilliseconds,
        monthAsLabel: monthAsLabel
    }
})();

module.exports = MyDates;
},{"../common/TimeWindow":18}],16:[function(require,module,exports){
/**
 * Created by py on 13/07/16.
 */

var PusherClient;

// param: String apiKey - Pusher API Key
// function: object constructor
// return: PusherClient object
PusherClient = (function(apiKey){

    var pusher = new Pusher(apiKey, {
        encrypted: true
    });

    var channels = {};

    // param: String channel - channel name to listen
    // param: String event - event name to listen
    // param: Function callback - method to execute when event arrives
    // function: registers the callback for specified channel and event
    // return: true, if function ended successfully
    var subscribe = function (channel, event, callback) {
        if(!channels[channel]) {
            channels[channel] = [];
        }
        channels[channel].push({event: event, callback: callback});

        var c = pusher.subscribe(channel);
        c.bind(event, callback);
        return true;
    };

    var getChannels = function(){
        return channels;
    };

    return {
        subscribe: subscribe,
        channels: getChannels
    }
})('aaa12f45b280acb74218');

module.exports = PusherClient;
},{}],17:[function(require,module,exports){
/**
 * Created by py on 23/07/16.
 */

var Shared;

var MyDates = require('../common/MyDates');

// param: void
// function: Shared module constructor. Module returns Singleton state object,
// which is used to share data between all instances, nested in views.
// return: Shared module
Shared = (function() {

    var singleton;

    // param: HttpResponse res - http response, or any other object with some keys;
    // param: Object obj - object, that we set from response
    // function: sets all values from obj[keys] to values from res with the same keys
    // return: modified obj.
    var setValues = function(res, obj) {
        var data;
        if(res.data) {
            data = res.data;

        }
        else if(!res.data) {
            data = res;
        }

        var keys = Object.keys(data);
        // console.log(keys);
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if(!obj[key]) {
                throw new Error('Key, you are trying to set, does not exists in obj. Check you response.data and compare it with object.');
            }
            else {
                obj[key] = data[key];
            }
        }

        return obj;
    };

    // param: HttpService http - reference to Angular $http service. Ignored, if singleton already exists.
    // param: MyDates md - reference to MyDates service. Ignored, if singleton already exists.
    // param: String tw - string representation of 'all' timewindow. Ignored, if singleton already exists.
    // param: int sid - subview id, index of subview currently visible on MainView.
    // Starts with 1. Ignored, if singleton already exists.
    // function: return instance, if it exists. If not, create new singleton instance and return it.
    // return: singleton object with shared values and functions
    var init = function() {
        singleton = {service: undefined, fns: undefined, state: undefined};
        singleton.service = {
            http: {},
            MyDates: MyDates
        };
        singleton.fns = {
            setValues: setValues
        };
        singleton.state = {
            currentMonth: MyDates.dateToString(new Date(), {y:1, m:1, d: undefined}),
            currentWeek: MyDates.numberOfWeek(new Date()),
            currentDay: MyDates.dateToString(new Date()),
            currentItem: undefined,
            isUpdated: false
        };


        // singleton.state = {
        //     currentMonth: "201502",
        //     currentWeek: 0,
        //     currentDay: "20150201"
        // };
        singleton.user = {};
        return singleton;
    };

    // param: void
    // function: returns singleton instance
    // return: singleton
    var get = function() {
        if(singleton) {
            return singleton;
        }
        else {
            init();
        }
    };

    // param: String key - the name of attribute you want to change
    // param: Object value - the value of parameter, you want to change
    // function: changes the internal parameter of Shared service to new value
    // return: Shared object, so method can be chained.
    var change = function(key, value) {
        var allowedKeys = ["currentMonth", "currentWeek", "currentDay", "currentItem", "isUpdated", "http", "user"];
        var isAllowedKey = function(element, index, array) {
            return element === key;
        };
        if(!allowedKeys.some(isAllowedKey)) {
            throw new Error('Wrong key string. Allowed keys are: ' + allowedKeys.toString());
        }
        else if(key === "http"){
            singleton.service.http = value;
        }
        else if(key === 'user'){
            singleton[key] = value;
        }
        else {
            singleton.state[key] = value;
        }
        return singleton;
    };

    var log = function(){
        console.log(singleton);
    };

    // initialize singleton internally, so it exists every time, I call require('../common/Shared)
    init();

    return {
        getInstance: get,
        change: change,
        log: log
    }

})();

module.exports = Shared;
},{"../common/MyDates":15}],18:[function(require,module,exports){

var TimeWindow;

// param: Object args
// function: object constructor
// return: TimeWindow object

TimeWindow = function(args) {
    if(args) {
        this.set(args);
    }
    else {
        this.startDate = new Date(Date.UTC(1970,0,1));
        this.endDate = new Date(Date.UTC(2100,0,1));
        this.year = null;
        this.month = null;
        this.day = null;
    }
};

TimeWindow.prototype = {
    // param: Object args
    // function: set TimeWindow object properties based on given properties in args.
    // note: TimeWindow object is created based exactly on the given args.
    // It means that if you want March-2016, you should give {year: 2016, month: 3}
    // If you give args as formulas based on Date.getMonth(), please take into account, that Javascript Date object
    // gives you back 2 for March, not 3.
    // return: modified TimeWindow object
    set: function(args){
        const DAY = 24 * 3600 * 1000;
        if(!args) {
            throw new Error('no args provided - TimeWindow object remained unchanged');
        }
        else if(args.day) {
            if(args.month < 0) {
                if(args.day < 0) {
                    this.startDate = new Date(Date.UTC(args.year, args.month, args.day + 1));
                }
                else {
                    this.startDate = new Date(Date.UTC(args.year, args.month, args.day));
                }
            }
            else {
                if(args.day < 0) {
                    this.startDate = new Date(Date.UTC(args.year, args.month - 1, args.day + 1));
                }
                else {
                    this.startDate = new Date(Date.UTC(args.year, args.month - 1, args.day));
                }
            }
            this.endDate = new Date(Date.UTC(this.startDate.valueOf() + DAY));
            this.year = this.startDate.getFullYear();
            this.month = this.startDate.getMonth() + 1;
            this.day = this.startDate.getDate();
        }
        else if(!args.day && args.month) {

            if(args.month < 0) {
                this.startDate = new Date(Date.UTC(args.year, args.month, 1));
                this.endDate = new Date(Date.UTC(args.year, args.month + 1, 1));
            }
            else {
                this.startDate = new Date(Date.UTC(args.year, args.month - 1, 1));
                this.endDate = new Date(Date.UTC(args.year, args.month, 1));
            }
            this.year = this.startDate.getFullYear();
            this.month = this.startDate.getMonth() + 1;
            this.day = null;

        }
        else if(!args.day && !args.month && args.year) {
            this.startDate = new Date(Date.UTC(args.year,0,1));
            this.endDate = new Date(Date.UTC(args.year + 1,0,1));
            this.year = this.startDate.getFullYear();
            this.month = null;
            this.day = null;
        }

        return this;
    }
};

module.exports = TimeWindow;
},{}],19:[function(require,module,exports){
/**
 * Created by py on 25/07/16.
 */

var Week;

var MyDates = require('./MyDates');
var Day = require('./Day');
var Shared = require('./Shared');

// param: int weekNum - the number of week in month (from 0 to 3-5)
// param: String month - the string-encoded TimeWindow, which is on month level.
// param: Object state
// param: Bool isTransformRequired - tells constructor to apply transformation for Bootstrap
// function: object constructor
// return: Week object
Week = function(weekNum, month, state, isTransformRequired) {
    var self = this;

    // param: int weekNum - the number of week in month (from 0 to 3-5), where day belongs to.
    // param: Bool isTransformRequired - tells constructor to apply transformation for Bootstrap grid.
    // param: Object state
    // function: setup static parameters of Week object
    // return: self, so method can be chained.
    self.setUp = function(weekNum, month, state, isTransformRequired) {
        self.month = month;
        self.weekNum = weekNum;
        self.isTransformed = isTransformRequired;
        return self;
    };

    // param: void, since it is just initialization
    // function: init self.html object, which is exposed to HTML template
    // return: self, so method can be chained.
    self.initHTML = function(){
        self.html = {};
        self.html.daysRange = [0,0];
        self.html.isSelected = false;
        self.html.days = [];
        return self;
    };

    // param: Object state
    // function: create Day objects and stash them into self.html.days (array)
    // return: self, so method can be chained
    self.setDays = function (state) {
        // param: Object state
        // function: create Days in first week (which has weekNum = 0)
        // return: void
        var setFirstWeek = function (state) {
            var firstDayDelta = MyDates.firstDay(self.month);
            for(var i = 0; i < firstDayDelta; i++){
                self.html.days.push(null);
            }
            var dayNum;
            for(var k = firstDayDelta; k < 7; k ++) {
                dayNum = k - firstDayDelta + 1;
                self.html.days.push(new Day(dayNum, 0, self.month, state));
            }
        };

        // param: Object state
        // function: create Days in other weeks (which has weekNum in range [1:5])
        // return: void
        var setOtherWeeks = function(state){
            var firstDay = MyDates.firstDay(self.month);
            var maxDays = MyDates.daysInMonth(self.month);
            var dayNum;
            for(var j = 0; j < 7; j++) {
                dayNum = j + self.weekNum * 7 + 1 - firstDay;
                if(dayNum < maxDays){
                    self.html.days.push(new Day(dayNum, self.weekNum, self.month, state));
                }
                else if(dayNum === maxDays){
                    self.html.daysRange[1] = dayNum;
                    self.html.days.push(new Day(dayNum, self.weekNum, self.month, state));
                }
                else {
                    self.html.days.push(null);
                }
            }
        };

        // param: Week w - Week object that has to be transformed
        // param: int cells - number of cells for grid
        // function: append null in front and null after the w.days array, so w.days length -> 9.
        // and then, slice Week to three arrays, so w.days -> something like [[null, Day, Day], [Day, Day, Day], [Day, Day, null]]
        var transform4BoostrapGrid = function(w, cells){
            var transformedWeek = [];
            var cell = [];
            if(cells === 3) {
                w.html.days.unshift(null);
                w.html.days.push(null);
                for(var i = 0; i < w.html.days.length; i = i + 3){
                    cell = w.html.days.slice(i, i + 3);
                    transformedWeek.push(cell);
                }
            }
            if(cells === 2){
                w.html.days.push(null);
                for(var j = 0; j < w.html.days.length; j = j + 4){
                    cell = w.html.days.slice(j, j + 4);
                    transformedWeek.push(cell);
                }
            }

            return transformedWeek;
        };

        // MAIN LOOP SET DAYS
        if(self.weekNum === 0) {
            setFirstWeek(state);
        }
        else {
            setOtherWeeks(state);
        }

        if(self.isTransformed) {
            self.html.days = transform4BoostrapGrid(self, 2);
        }
        return self;
    };

    // param: int weekNum - the number of week in month (from 0 to 3-5)
    // param: int firstDay - the day of week of the first day in the month (0 - Sunday, 1 - Monday...)
    // function: setup start day for week and end day for week
    // return: self, so method can be chained.
    self.setDayRange = function(weekNum, firstDay){
        if(weekNum === 0) {
            self.html.daysRange[0] = 1;
            self.html.daysRange[1] = 7 - firstDay;
        }
        else {
            self.html.daysRange[0] = weekNum * 7 + 1 - firstDay;
            self.html.daysRange[1] = weekNum * 7 + 7 - firstDay;
        }
        return self;
    };

    // param: Object state
    // function: updates Week object after state change
    // return: self, so method can be chained
    self.update = function(state) {

        // param: Object state
        // function: ask Day objects in self.html.days to update
        // return: self, so method can be chained
        self.updateDays = function (state) {
            if(self.isTransformed === true) {
                for(var c = 0; c < self.html.days.length; c++){
                    for(var d = 0; d < self.html.days[0].length; d++){
                        if(self.html.days[c][d] !== null){
                            self.html.days[c][d].update(state);
                        }
                    }
                }
            }
            else {
                for(var i = 0; i < self.html.days.length; i++){
                    if(self.html.days[i] !== null){
                        self.html.days[i].update(state);
                    }
                }
            }
            return self;
        };

        // param: Object state
        // function: decides, whether Week should be shown as 'selected' in HTML. Writes decision to self.html.isSelected
        // return: self, so method can be chained
        self.setIsSelected = function(state) {
            if(state.currentWeek){
                self.weekNum === state.currentWeek.weekNum ? self.html.isSelected = true : self.html.isSelected = false;
            }
            return self;
        };

        // MAIN LOOP FOR UPDATE
        self.setIsSelected(state)
            .updateDays(state);
        return self;
    };

    // param: Object state
    // function: pushes month to state, if it is current
    // return: self, so method  can be chained.
    self.pushToState = function (state) {
        if(state.currentWeek === undefined) {
            if(self.weekNum === MyDates.numberOfWeek(new Date())){
                Shared.change('currentWeek', self);
            }
        }
        return self;
    };
    
    // MAIN LOOP
    self.setUp(weekNum, month, state, isTransformRequired)
        .initHTML()
        .setDays(state)
        .setDayRange(weekNum, MyDates.firstDay(self.month))
        .update(state);
};

module.exports = Week;
},{"./Day":8,"./MyDates":15,"./Shared":17}],20:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
module.exports = {
  100: 'Continue',
  101: 'Switching Protocols',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request-URI Too Large',
  415: 'Unsupported Media Type',
  416: 'Requested Range not Satisfiable',
  417: 'Expectation Failed',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Time-out',
  505: 'HTTP Version not Supported',
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505
};

},{}],21:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[2]);
