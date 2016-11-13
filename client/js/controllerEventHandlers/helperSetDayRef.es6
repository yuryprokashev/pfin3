/**
 *Created by py on 31/10/2016
 */

'use strict';

const MyDates = require('../MyDates');

function helperSetDayRef(dayCode, scope) {
    dayCode = scope.state.monthRef.monthString + MyDates.dayToString(dayCode);
    return scope.state.weekRef.getDayRef(dayCode);
}
module.exports = helperSetDayRef;