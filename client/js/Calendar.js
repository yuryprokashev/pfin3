'use strict';

/**
 * Created by py on 24/07/16.
 */

var Calendar;

var MyDates = require('./MyDates');
var Week = require('./Week');

// param: Object state
// function: object constructor
// return: Calendar object
Calendar = function Calendar(state) {

    var self = this;
    self.state = state;
    // param: Object state
    // function: init the object. Set up storage for weeks, construct Weeks.
    // return: void
    this.init = function () {
        self.weeks = [];
        self.monthString = self.state.monthRef.monthString;
        var numOfWeeks = MyDates.weeksInMonth(self.monthString);
        for (var i = 0; i < numOfWeeks; i++) {
            self.weeks.push(new Week(i, self.monthString, self.state, true));
        }
    };

    // param: String t - string representation of TimeWindow object
    // function: decide, whether Calendar should be rebuilt (month changed)
    // return: Bool decision
    var isRenewCalendar = function isRenewCalendar(t) {
        var decision = false;
        if (t !== self.monthString) {
            decision = true;
        }
        return decision;
    };

    var update = function update() {
        for (var i = 0; i < self.weeks.length; i++) {
            self.weeks[i].update();
        }
    };

    this.update = function () {
        if (isRenewCalendar(self.state.monthRef.monthString)) {
            this.init();
            update();
        } else {
            update();
        }
    };

    // MAIN LOOP
    this.init();
};

Calendar.prototype.getFlatDays = function () {
    var flatDays = [];
    this.weeks.forEach(function (week) {
        var oneWeek = week.getFlatDays();
        oneWeek.forEach(function (day) {
            flatDays.push({ dayNum: day.dayNum, day: day });
        });
    });
    return flatDays;
};

module.exports = Calendar;

//# sourceMappingURL=Calendar.js.map