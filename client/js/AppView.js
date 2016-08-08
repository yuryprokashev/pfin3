/**
 * Created by py on 23/07/16.
 */

var AppView;

var MonthSwitch = require('../../common/MonthSwitch');
var Calendar = require('../../common/Calendar');
var Dashboard = require('../../common/Dashboard');
var MessagePoster = require('../../common/MessagePoster');
var PusherClient = require('../../common/PusherClient');

AppView = function(httpService) {

    var Shared = require('../../common/Shared');
    Shared.change("http", httpService);
    var state = Shared.getInstance().state;

    this.state = state;

    this.monthSwitchView = new MonthSwitch(state);
    this.calendarView = new Calendar(state);
    this.dashboardView = new Dashboard(state);
    this.expensePoster = new MessagePoster(state);

    this.update = function(state) {
        this.monthSwitchView.update(state);
        this.calendarView.update(state);
        this.dashboardView.update(state);
        this.expensePoster.update(state);
        console.log(this);
    };

    var self = this;
    // param: Object data - arbitrary object received by PusherClient
    // function: request update for all data in views
    // return: void
    var messageScoredCallback = function (data) {
        self.update(state);
    };
    PusherClient.subscribe("message", "message::scored", messageScoredCallback);

    this.update(state);
};

module.exports = AppView;