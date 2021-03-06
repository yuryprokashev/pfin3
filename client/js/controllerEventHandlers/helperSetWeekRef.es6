/**
 *Created by py on 31/10/2016
 */
'use strict';

const getWeekForDay = require('./helperGetWeekForDay.es6');
const MyDates = require('../MyDates.es6');

function helperSetWeekRef(dayNum, scope) {
    if (dayNum > MyDates.daysInMonth(scope.state.monthRef.monthString)) {
        dayNum = MyDates.daysInMonth(scope.state.monthRef.monthString);
    }
    var dayCode = scope.state.monthRef.monthString + MyDates.dayToString(dayNum);
    var newWeek = getWeekForDay(dayCode);
    return scope.view.calendarView.weeks[newWeek];
}

module.exports = helperSetWeekRef;