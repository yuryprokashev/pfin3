/**
 *Created by py on 01/11/2016
 */

'use strict';

const getDayCode  = require('./helperGetDayCode');
const setWeekRef = require('./helperSetWeekRef');
const setDayRef = require('./helperSetDayRef');

function handleDirectiveCalendarViewReady(event, args, scope) {
    console.log('directive::calendarView::ready');
    var dayCode = getDayCode(scope);
    scope.state.weekRef = setWeekRef(dayCode, scope);
    scope.state.dayRef = setDayRef(dayCode, scope);
    scope.view.calendarView.update();
    scope.view.initExpensePoster(scope.state);
}
module.exports = handleDirectiveCalendarViewReady;