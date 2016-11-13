/**
 *Created by py on 01/11/2016
 */

'use strict';
const MyDates = require('../MyDates');

function helperGetDayCode(scope) {
    var d = scope.state.dayRef !== undefined ? scope.state.dayRef.timeWindow : scope.state.init.day;
    return MyDates.getDateFromString(d);
}
module.exports = helperGetDayCode;