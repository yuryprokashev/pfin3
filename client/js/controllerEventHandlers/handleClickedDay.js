/**
 *Created by py on 01/11/2016
 */
'use strict';

var hideContextMenu = require('./helperHideContextMenu');
var setWeekRef = require('./helperSetWeekRef');
function handleClickedDay(event, args, scope, timeout) {

    scope.clicks.push(event);
    hideContextMenu(scope);
    scope.state.dayRef = args.day;
    scope.state.itemRef = undefined;
    scope.state.weekRef = setWeekRef(scope.state.dayRef.dayNum, scope);
    if (scope.state.isFormShown === true) {
        scope.state.isFormShown = false;
    }
    scope.view.calendarView.update();
    scope.view.expensePoster.update();

    timeout(function () {
        if (scope.clicks.length === 1) {} else if (scope.clicks.length >= 2) {
            scope.$emit('dblclicked::day', { day: args.day });
        }
        scope.clicks = [];
    }, 200);
}
module.exports = handleClickedDay;

//# sourceMappingURL=handleClickedDay.js.map