/**
 *Created by py on 01/11/2016
 */

'use strict';

const getDayCode  = require('./helperGetDayCode.es6');
const setWeekRef = require('./helperSetWeekRef.es6');
const setDayRef = require('./helperSetDayRef.es6');

function handleDirectiveCalendarViewReady(event, args, scope) {
    console.log('directive::calendarView::ready');
    var dayCode = getDayCode(scope);
    scope.state.weekRef = setWeekRef(dayCode, scope);
    scope.state.dayRef = setDayRef(dayCode, scope);
    scope.view.calendarView.update();
    scope.view.initExpensePoster(scope.state);
}
module.exports = handleDirectiveCalendarViewReady;