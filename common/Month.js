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