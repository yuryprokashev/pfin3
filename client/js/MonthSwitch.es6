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
    self.cache = new Map();

    // param: Object state
    // function: constructs the array of 5 Months: 2 back, current, 2 forward.
    // return: void
    var init = function() {
        self.months = [];
        var months = MyDates.headingsArray(MyDates.neighbours(self.state.init.month, [-2, 2]),'');
        // self.state.updatedMonths = months;
        for(var i = 0; i < months.length; i++) {
            var month = new Month(months[i], self.state);
            self.cache.set(months[i], month);
            self.months.unshift(month);
            if(i === 2){
                self.monthRef = month;
            }
        }
        self.html = {};
        self.html.currency = self.state.user.public.settings.defaults.currency.toLowerCase();
        self.html.window = [0, 5];
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

// MonthSwitch.prototype.getURLArray = function() {
//     var result = [];
//     var self = this;
//     for (var i in self.months) {
//         result.push(self.months[i].getUrl);
//     }
//     return result;
// };

MonthSwitch.prototype.findNeighbourMonths = function(initial, range){
    return MyDates.headingsArray(MyDates.neighbours(initial, range),'');
};

MonthSwitch.prototype.moveWindow = function(step){
    // HELPER FUNCTIONS
    let _this = this;
    function isMoveToFuture (step){
        return step > 0;
    }

    function isInCache(month) {
        return _this.cache.has(month);
    }

    function isWindowAtZero() {
        return _this.html.window[0] === 0;
    }

    function createMonth(month){
        if(!isInCache(month)){
            let m = new Month(month, _this.state);
            _this.cache.set(month, m);
            if(isMoveToFuture(step)){
                _this.months.unshift(m);
            }
            else {
                _this.months.push(m);
            }
            return m;
        }
        else if(isInCache(month)){
            return _this.cache.get(month);
        }
    }

    function changeWindow(step){
        if(isMoveToFuture(step)){
            _this.html.window[0] += step;
            _this.html.window[1] += step;
        }
        else if(!isMoveToFuture(step)){
            if(!isWindowAtZero()){
                _this.html.window[0] += step;
                _this.html.window[1] += step;
            }
        }
    }

    function firstVisibleMonth(){
        return _this.months[_this.html.window[0]].monthString
    }

    function lastVisibleMonth(){
        return _this.months[_this.html.window[1] - 1].monthString;
    }

    // MAIN FLOW
    let rng = isMoveToFuture(step) ? [1, step] : [step, -1];
    let target = isMoveToFuture(step) ? lastVisibleMonth() : firstVisibleMonth();
    let createdMonths = this.findNeighbourMonths(target, rng).map(createMonth);
    console.log(createdMonths);
    this.months.sort(function(a,b){
        if(a.monthString > b.monthString){
            return 1;
        }
        if(a.monthString < b.monthString){
            return -1;
        }
        return 0;
    });
    changeWindow(step);
    return createdMonths;
};

module.exports = MonthSwitch;