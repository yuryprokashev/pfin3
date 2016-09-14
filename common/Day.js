/**
 * Created by py on 25/07/16.
 */

var Day;

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
    self.state = state;

    // param: int dayNum - the day number in month (from 1 to 28-31)
    // param: int weekNum - the number of week in month (from 0 to 3-5), where day belongs to.
    // param: String month - the string-encoded TimeWindow, which is on month level.
    // Formatted as "YYYYMM".
    // param: Object state
    // function: setup static parameters of Day object
    // return: self, so method can be chained.
    self.setUp = function(dayNum, weekNum, month) {
        self.dayNum = dayNum;
        self.weekNum = weekNum;
        self.month = month;
        self.timeWindow = self.month + MyDates.dayToString(dayNum);
        var dayCode = self.timeWindow;
        var payloadType = self.state.payloadType;
        var sortParam = self.state.sortParam;
        var sortOrder = self.state.sortOrder;
        self.getUrl = `api/v1/payload/${dayCode}/${payloadType}/${sortParam}/${sortOrder}`;
        // self.getUrl = `api/v1/day/${dayCode}`;
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
        self.html.shownItems = [];
        self.html.isFuture = false;

        // param: String arg - the name of the property, over which we will sum. E.g. Day['name']
        // param: Array [Object] arr - the array, over which elements we will sum
        // function: calculate the sum of the 'name' property in the array
        // return: int sum
        self.html.sum = function(arg, arr) {
            var s = 0;
            for(var i = 0; i < arr.length; i++) {
                if(arr[i][arg] === undefined) {
                    s += 0;
                }
                else if(typeof arr[i][arg] !== 'number') {
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
    self.setIsSelected = function () {
        var hitMonth, hitWeek, hitDay;
        self.month === self.state.monthRef.monthString ? hitMonth = true : hitMonth = false;
        self.weekNum === self.state.weekRef.weekNum ? hitWeek = true : hitWeek = false;
        var day = self.month + MyDates.dayToString(self.dayNum);
        day === self.state.dayRef.timeWindow ? hitDay = true : hitDay = false;
        // console.log(`hitMonth: ${hitMonth}, hitWeek: ${hitWeek}, hitDay: ${hitDay}`);
        self.html.isSelected = hitMonth && hitWeek && hitDay;
        return self;
    };

    // param: Object state
    // function: decides, whether Day is in selected week so it should have special width in HTML. Writes decision to self.html.isInSelectedWeek
    // return: self, so method can be chained
    self.setIsInSelectedWeek = function() {
        self.weekNum === self.state.weekRef.weekNum ? self.html.isInSelectedWeek = true : self.html.isInSelectedWeek = false;
        return self;
    };

    // param: Bool isInSelectedWeek - flag, that tells if Day is in selected week
    // function: set maximum number of items shown in Day
    // return: self, so method can be chained.
    self.setMaxItems = function () {
        self.html.maxItems = self.html.isInSelectedWeek ? 20 : 0;
        self.html.shownItems = self.html.items.slice(0, self.html.maxItems);
        return self;
    };

    // param: Object state
    // function: change self.html parameters according to 'state'
    // return: void
    self.update = function(){
        self.setIsInSelectedWeek()
            .setIsSelected()
            .setMaxItems()
            .setIsFuture();
            // .updateItems(state);
    };

    // MAIN LOOP
    self.setUp(dayNum, weekNum, month)
        .initHTML();
};

Day.prototype.addItem = function(item) {
    this.html.items.push(item);
};

Day.prototype.get = function(callback) {
    var self = this;
    var http = shared.service.http;
    http.get(this.getUrl)
        .then(function success (response){
            callback(response.data, self);
        }, function error (response){
            callback(response.data, self);
        });
};

Day.prototype.setIsFuture = function() {
    var self = this;
    var tws = MyDates.stringToTw(self.timeWindow);
    var today = new Date();
    tws.startDate > today ? self.html.isFuture = true : self.html.isFuture = false;
    return self;
};

module.exports = Day;