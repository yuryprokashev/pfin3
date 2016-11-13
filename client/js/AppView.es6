/**
 * Created by py on 23/07/16.
 */

var AppView;

var MonthSwitch = require('./MonthSwitch');
var Calendar = require('./Calendar');
// var Dashboard = require('./Dashboard');
var MessagePoster = require('./MessagePoster');

AppView = function() {

    this.init = function(state) {
        this.state = state;
        this.monthSwitch = new MonthSwitch(state);
        // this.calendarView = new Calendar(state);
        // this.dashboardView = new Dashboard(state);
        // this.expensePoster = new MessagePoster(state);
        console.log(this);
    };

    this.initCalendarView = function() {
        return new Calendar(this.state);
    };

    this.initExpensePoster = function() {
        this.expensePoster = new MessagePoster(this.state);
    };


    this.update = function() {
        this.monthSwitch.update();
        this.calendarView.update();
        // this.dashboardView.update(state);
        this.expensePoster.update();
        // console.log(this);
    };
};
module.exports = AppView;
