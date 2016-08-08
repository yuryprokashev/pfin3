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