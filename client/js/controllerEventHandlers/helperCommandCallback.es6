/**
 *Created by py on 31/10/2016
 */
'use strict';

const getDaysAsync = require('./helperGetDaysAsync');
const getMonthDataAsync = require('./helperGetMonthDataAsync');
const hideContextMenu = require('./helperHideContextMenu');

function helperCommandCallback(response, scope, http) {
    hideContextMenu(scope);
    scope.$applyAsync(function () {
        getDaysAsync(scope, http);
        getMonthDataAsync(scope.state.monthRef, http);
        scope.view.calendarView.update();
    });
}

module.exports = helperCommandCallback;