/**
 * Created by py on 24/07/16.
 */

var Month;

var TimeWindow = require('./TimeWindow');
var MyDates = require('./MyDates');
var ContextMenu = require('../client/js/ContextMenu');

// param: String t - string representation of timeWindow object
// param: Object state
// function: object constructor
// return: Month object
Month = function (t, state) {
    var self = this;
    self.state = state;

    // param: String month - the string-encoded TimeWindow, which is on month level.
    // Formatted as "YYYYMM".
    // param: Object state
    // function: setup static parameters of Month object
    // return: self, so method can be chained.
    self.setUp = function(t) {
        self.monthString = t;
        self.getUrl = `api/v1/payload/monthData/${self.monthString}`;
        self.ctxMenu = new ContextMenu(self.state, self);
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
        self.html.currency = self.state.user.public.settings.defaults.currency.toLowerCase();
        return self;
    };

    // param: Object state
    // function: decides, whether Month should be shown as 'selected' in HTML. Writes decision to self.html.isSelected
    // return: self, so method can be chained
    self.setIsSelected = function () {
        if(self.state.init.month !== undefined) {
            self.monthString === self.state.init.month ? self.html.isSelected = true : self.html.isSelected = false
        }

        else if(self.state.init.month === undefined) {
            self.monthString === self.state.monthRef.monthString ? self.html.isSelected = true : self.html.isSelected = false;

        }
        return self;
    };

    self.setDefaultTotalsStyle = function() {
        self.html.style.plan = {width: '50%'};
        self.html.style.fact = {width: '50%'};
        return self;
    };

    self.setTotals = function(totals) {
        var all = function () {
            return self.html.totals.fact + self.html.totals.plan;
        };

        self.html.totals.fact = totals.fact;
        self.html.totals.plan = totals.plan;

        if(totals.plan === 0 && totals.fact === 0) {
            self.setDefaultTotalsStyle();
        }
        else {
            self.html.style.plan = {width: Math.floor(100 * self.html.totals.plan/ all()) + '%'};
            self.html.style.fact = {width: Math.ceil(100 * self.html.totals.fact/ all()) + '%'};
        }

        return self;
    };

    self.update = function (totals) {
        self.setIsSelected()
            .setTotals(totals);
        return self;
    };

    // MAIN LOOP
    self.setUp(t)
        .initHTML()
        .setDefaultTotalsStyle();
};


module.exports = Month;