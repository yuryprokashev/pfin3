/**
 * Created by py on 24/07/16.
 */

var MonthSwitch;

var Month = require('./Month');
var MyDates = require('./MyDates');
var Shared = require('./Shared');

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
        Shared.change('updatedMonths', months);
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