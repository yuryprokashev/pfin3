/**
 *Created by py on 01/11/2016
 */

'use strict';
const getDaysAsync = require('./helperGetDaysAsync');
const setContextMenuOptions = require('./helperSetContextMenuOptions');
function handleDirectiveMonthSwitchReady (event, args, scope, http) {

    var months = scope.view.monthSwitch.months;
    var completed = 0;
    var responses = [];

    var finish = function finish() {
        responses.sort(function (a, b) {
            if (a.index > b.index) {
                return 1;
            } else if (a.index < b.index) {
                return -1;
            }
        });

        for (var i = 0; i < scope.view.monthSwitch.months.length; i++) {
            scope.view.monthSwitch.months[i].update(responses[i].totals);
        }
        var newCalendar = scope.view.initCalendarView(scope.state);
        scope.view.calendarView = newCalendar;
        scope.cache.calendars.set(scope.state.monthRef.monthString, newCalendar);

        getDaysAsync(scope, http);
        scope.$emit('directive::calendarView::ready');
    };

    months.forEach(function (m) {
        http.get(m.getUrl).then(function (res) {
            responses.push({ index: months.indexOf(m), totals: res.data.totals });
            if (++completed === months.length) {
                finish();
            }
        });
    });
    scope.state.monthRef = args.monthRef;
    scope.state.init.month = undefined;

    setContextMenuOptions(scope);
}

module.exports = handleDirectiveMonthSwitchReady;