/**
 *Created by py on 31/10/2016
 */

'use strict';

const stopCommandProcessing = require('./helperStopCommandProcessing.es6');
const UIItem = require('../UIItem.es6');

function helperGetDaysAsync (scope, http) {
    // HELPERS
    function getAllItemsForMonth(fnSuccess, fnError) {
        http.get('/browser/api/v1/payload/' + scope.state.monthRef.monthString + '/1/dayCode/-1').then(fnSuccess).catch(fnError);
    }
    function setItemsToDays(response) {
        // let days = $scope.view.calendarView.getFlatDays();
        var groupedItems = [];
        function isDataForDayExists(day) {
            return groupedItems[day.timeWindow] !== undefined;
        }
        response.data.map(function (item) {
            if (groupedItems[item.dayCode] === undefined) {
                groupedItems[item.dayCode] = { dayCode: item.dayCode, items: [] };
            }
            groupedItems[item.dayCode].items.push(item);
        });
        // console.log(groupedItems);
        days.forEach(function (day) {
            // console.log(day.day);
            // console.log(groupedItems[day.day.timeWindow]);
            if (isDataForDayExists(day.day)) {
                day.day.html.items = groupedItems[day.day.timeWindow].items.map(function (item) {
                    var transformedItem = UIItem.transformToUIItem(item);
                    transformedItem.isItemProcessing = false;
                    transformedItem.isSaved = true;
                    return transformedItem;
                });
            } else {
                day.day.html.items = [];
            }
            day.day.update();
            stopCommandProcessing(scope);
        });
    }

    function logError(err) {
        console.log(err);
    }

    // MAIN FLOW
    var days = scope.view.calendarView.getFlatDays();
    scope.$applyAsync(function () {
        getAllItemsForMonth(setItemsToDays, logError);
    });
}

module.exports = helperGetDaysAsync;