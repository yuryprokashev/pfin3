/**
 *Created by py on 31/10/2016
 */

'use strict';

var getMonthDataAsyc = require('./helperGetMonthDataAsync');

function handleClickedChevron(event, args, scope, http) {
    var createdMonths = scope.view.monthSwitch.moveWindow(args.step);
    scope.$applyAsync(function () {
        createdMonths.forEach(function (h) {
            return function (item) {
                getMonthDataAsyc(item, h);
            };
        }(http));
    });
}

module.exports = handleClickedChevron;

//# sourceMappingURL=handleClickedChevron.js.map