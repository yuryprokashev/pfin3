'use strict';

/**
 * Created by py on 25/07/16.
 */

var Week;

var MyDates = require('./MyDates');
var Day = require('./Day');

// param: int weekNum - the number of week in month (from 0 to 3-5)
// param: String month - the string-encoded TimeWindow, which is on month level.
// param: Object state
// param: Bool isTransformRequired - tells constructor to apply transformation for Bootstrap
// function: object constructor
// return: Week object
Week = function Week(weekNum, month, state, isTransformRequired) {
    var self = this;
    self.state = state;

    // param: int weekNum - the number of week in month (from 0 to 3-5), where day belongs to.
    // param: Bool isTransformRequired - tells constructor to apply transformation for Bootstrap grid.
    // param: Object state
    // function: setup static parameters of Week object
    // return: self, so method can be chained.
    self.setUp = function (weekNum, month, isTransformRequired) {
        self.month = month;
        self.weekNum = weekNum;
        self.isTransformed = isTransformRequired;
        self.days = [];
        return self;
    };

    // param: void, since it is just initialization
    // function: init self.html object, which is exposed to HTML template
    // return: self, so method can be chained.
    self.initHTML = function () {
        self.html = {};
        self.html.daysRange = [0, 0];
        self.html.isSelected = false;
        self.html.days = [];
        return self;
    };

    // param: Object state
    // function: create Day objects and stash them into self.html.days (array)
    // return: self, so method can be chained
    self.setDays = function () {
        // param: Object state
        // function: create Days in first week (which has weekNum = 0)
        // return: void
        var setFirstWeek = function setFirstWeek() {
            var firstDayDelta = MyDates.firstDay(self.month);
            for (var i = 0; i < firstDayDelta; i++) {
                self.days.push(null);
            }
            var dayNum;
            for (var k = firstDayDelta; k < 7; k++) {
                dayNum = k - firstDayDelta + 1;
                self.days.push(new Day(dayNum, 0, self.month, self.state, k));
            }
        };

        // param: Object state
        // function: create Days in other weeks (which has weekNum in range [1:5])
        // return: void
        var setOtherWeeks = function setOtherWeeks() {
            var firstDay = MyDates.firstDay(self.month);
            var maxDays = MyDates.daysInMonth(self.month);
            var dayNum;
            for (var j = 0; j < 7; j++) {
                dayNum = j + self.weekNum * 7 + 1 - firstDay;
                if (dayNum < maxDays) {
                    self.days.push(new Day(dayNum, self.weekNum, self.month, self.state, j));
                } else if (dayNum === maxDays) {
                    self.html.daysRange[1] = dayNum;
                    self.days.push(new Day(dayNum, self.weekNum, self.month, self.state, j));
                } else {
                    self.days.push(null);
                }
            }
        };

        // param: Week w - Week object that has to be transformed
        // param: int cells - number of cells for grid
        // function: append null in front and null after the w.days array, so w.days length -> 9.
        // and then, slice Week to three arrays, so w.days -> something like [[null, Day, Day], [Day, Day, Day], [Day, Day, null]]
        var transform4BoostrapGrid = function transform4BoostrapGrid(w, cells) {
            var transformedWeek = [];
            var cell = [];
            if (cells === 3) {
                w.days.unshift(null);
                w.days.push(null);
                for (var i = 0; i < w.days.length; i = i + 3) {
                    cell = w.days.slice(i, i + 3);
                    transformedWeek.push(cell);
                }
            }
            if (cells === 2) {
                w.days.push(null);
                for (var j = 0; j < w.days.length; j = j + 4) {
                    cell = w.days.slice(j, j + 4);
                    transformedWeek.push(cell);
                }
            }

            return transformedWeek;
        };

        // MAIN LOOP SET DAYS
        if (self.weekNum === 0) {
            setFirstWeek();
        } else {
            setOtherWeeks();
        }

        if (self.isTransformed) {
            self.html.days = transform4BoostrapGrid(self, 2);
        }
        return self;
    };

    // param: int weekNum - the number of week in month (from 0 to 3-5)
    // param: int firstDay - the day of week of the first day in the month (0 - Sunday, 1 - Monday...)
    // function: setup start day for week and end day for week
    // return: self, so method can be chained.
    self.setDayRange = function (weekNum, firstDay) {
        if (weekNum === 0) {
            self.html.daysRange[0] = 1;
            self.html.daysRange[1] = 7 - firstDay;
        } else {
            self.html.daysRange[0] = weekNum * 7 + 1 - firstDay;
            self.html.daysRange[1] = weekNum * 7 + 7 - firstDay;
        }
        return self;
    };

    // param: Object state
    // function: updates Week object after state change
    // return: self, so method can be chained
    self.update = function () {

        // param: Object state
        // function: ask Day objects in self.html.days to update
        // return: self, so method can be chained
        self.updateDays = function () {
            if (self.isTransformed === true) {
                for (var c = 0; c < self.html.days.length; c++) {
                    for (var d = 0; d < self.html.days[0].length; d++) {
                        if (self.html.days[c][d] !== null) {
                            self.html.days[c][d].update();
                        }
                    }
                }
            } else {
                for (var i = 0; i < self.html.days.length; i++) {
                    if (self.html.days[i] !== null) {
                        self.html.days[i].update();
                    }
                }
            }
            return self;
        };

        // param: Object state
        // function: decides, whether Week should be shown as 'selected' in HTML. Writes decision to self.html.isSelected
        // return: self, so method can be chained
        self.setIsSelected = function () {
            if (self.state.weekRef) {
                self.weekNum === self.state.weekRef.weekNum ? self.html.isSelected = true : self.html.isSelected = false;
            }
            return self;
        };

        // MAIN LOOP FOR UPDATE
        self.setIsSelected().updateDays();
        return self;
    };

    // MAIN LOOP
    self.setUp(weekNum, month, isTransformRequired).initHTML().setDays().setDayRange(weekNum, MyDates.firstDay(self.month));
};

Week.prototype.getDayRef = function (dayCode) {
    if (this.isTransformed === true) {
        for (var c = 0; c < this.html.days.length; c++) {
            for (var d = 0; d < this.html.days[0].length; d++) {
                if (this.html.days[c][d] !== null) {
                    if (this.html.days[c][d].timeWindow === dayCode) {
                        return this.html.days[c][d];
                    }
                }
            }
        }
    } else if (this.isTransformed === false) {
        for (var i = 0; i < this.html.days.length; i++) {
            if (this.html.days[i].timeWindow === dayCode) {
                return this.html.days[i];
            }
        }
    }
};

Week.prototype.getFlatDays = function () {
    var result = [];
    this.days.forEach(function (item) {
        if (item !== null) {
            result.push(item);
        }
    });
    return result;
};

module.exports = Week;

//# sourceMappingURL=Week.js.map