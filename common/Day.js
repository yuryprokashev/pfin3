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