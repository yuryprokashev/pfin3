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