/**
 *Created by py on 01/11/2016
 */

'use strict';

var getDayCode = require('./helperGetDayCode');
var setWeekRef = require('./helperSetWeekRef');
var setDayRef = require('./helperSetDayRef');

function handleDirectiveCalendarViewReady(event, args, scope) {
    console.log('directive::calendarView::ready');
    var dayCode = getDayCode(scope);
    scope.state.weekRef = setWeekRef(dayCode, scope);
    scope.state.dayRef = setDayRef(dayCode, scope);
    scope.view.calendarView.update();
    scope.view.initExpensePoster(scope.state);
}
module.exports = handleDirectiveCalendarViewReady;

//# sourceMappingURL=handleDirectiveCalendarViewReady.js.map