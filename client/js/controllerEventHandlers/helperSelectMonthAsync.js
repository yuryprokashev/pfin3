/**
 *Created by py on 01/11/2016
 */
'use strict';

var getDaysAsync = require('./helperGetDaysAsync');
var getDayCode = require('./helperGetDayCode');
var setWeekRef = require('./helperSetWeekRef');
var setDayRef = require('./helperSetDayRef');

function helperSelectMonthAsync(month, scope, http) {
    scope.$applyAsync(function () {
        scope.state.monthRef.html.isSelected = false;
        scope.state.monthRef = month;
        scope.state.monthRef.html.isSelected = true;

        if (scope.cache.calendars.has(month.monthString)) {
            scope.view.calendarView = scope.cache.calendars.get(month.monthString);
        } else {
            var newCalendar = scope.view.initCalendarView();
            scope.view.calendarView = newCalendar;
            getDaysAsync(scope, http);
            scope.cache.calendars.set(scope.state.monthRef.monthString, newCalendar);
        }
        var dayCode = getDayCode(scope);
        scope.state.weekRef = setWeekRef(dayCode, scope);
        scope.state.dayRef = setDayRef(dayCode, scope);
        scope.view.calendarView.update();
    });
}

module.exports = helperSelectMonthAsync;

//# sourceMappingURL=helperSelectMonthAsync.js.map