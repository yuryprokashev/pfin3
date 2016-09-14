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
    self.state = state;

    // param: Object state
    // function: constructs the array of 6 Months: 1 back, current, 4 forward.
    // return: void
    var init = function() {
        self.months = [];
        var months = MyDates.headingsArray(MyDates.neighbours(self.state.init.month, [-2, 3]),'');
        self.state.updatedMonths = months;
        for(var i = 0; i < months.length; i++) {
            var month = new Month(months[i], self.state);
            self.months.unshift(month);
            if(i === 3){
                self.monthRef = month;
            }
        }
    };

    // param: String t - current time window from state object
    // function: decide, whether or not to renew the months in MonthSwitch
    // return: Bool result
    var isRenewSwitch = function() {
        var result = false;
        var last = self.months.length - 1;
        if(self.monthRef.monthString === self.months[0].monthString || self.monthRef.monthString === self.months[last].monthString) {
            result = true;
        }
        return result;
    };

    var update = function() {
        for(var i = 0; i < self.months.length; i++) {
            self.months[i].isSelected = false;
            self.months[i].update();
        }
    };

    this.update = function() {
        if(isRenewSwitch()) {
            init();
            update();
        }
        else {
            update();
        }
    };

    // MAIN LOOP
    init(self.state);
};

MonthSwitch.prototype.getURLArray = function() {
    var result = [];
    var self = this;
    for (var i in self.months) {
        result.push(self.months[i].getUrl);
    }
    return result;
};

module.exports = MonthSwitch;