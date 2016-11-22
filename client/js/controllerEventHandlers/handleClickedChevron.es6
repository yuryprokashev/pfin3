/**
 *Created by py on 31/10/2016
 */

'use strict';
const getMonthDataAsyc = require('./helperGetMonthDataAsync.es6');

function handleClickedChevron(event, args, scope, http) {
    var createdMonths = scope.view.monthSwitch.moveWindow(args.step);
    scope.$applyAsync(function () {
        createdMonths.forEach(
            (function (h) {
                return function(item){
                    getMonthDataAsyc(item, h);
                };
            })(http)
        );
    });
}

module.exports = handleClickedChevron;