/**
 * Created by py on 23/07/16.
 */

var AppView;

var MonthSwitch = require('../../common/MonthSwitch');
var Calendar = require('../../common/Calendar');
var Dashboard = require('../../common/Dashboard');
var MessagePoster = require('../../common/MessagePoster');

AppView = function(httpService) {

    var Shared = require('../../common/Shared');
    Shared.change("http", httpService);
    var state = Shared.getInstance().state;

    this.state = state;

    this.monthSwitch = new MonthSwitch(state);
    this.calendarView = new Calendar(state);
    this.dashboardView = new Dashboard(state);
    this.expensePoster = new MessagePoster(state);

    this.update = function(state) {
        this.monthSwitch.update(state);
        this.calendarView.update(state);
        this.dashboardView.update(state);
        this.expensePoster.update(state);
    };

    this.update(state);
    console.log(this);
};

module.exports = AppView;