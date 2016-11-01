/**
 *Created by py on 31/10/2016
 */
'use strict';

var getDaysAsync = require('./helperGetDaysAsync');
var getMonthDataAsync = require('./helperGetMonthDataAsync');
var hideContextMenu = require('./helperHideContextMenu');

function helperCommandCallback(response, scope, http) {
    hideContextMenu(scope);
    scope.$applyAsync(function () {
        getDaysAsync(scope, http);
        getMonthDataAsync(scope.state.monthRef, http);
        scope.view.calendarView.update();
    });
}

module.exports = helperCommandCallback;

//# sourceMappingURL=helperCommandCallback.js.map