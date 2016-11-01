/**
 *Created by py on 31/10/2016
 */

'use strict';

var setWeekRef = require('./helperSetWeekRef');
var setDayRef = require('./helperSetDayRef');
var MyDates = require('../MyDates');

function helperSelectItem(item, scope) {
    var clip = scope.state.clipboard;
    if (clip[0] !== undefined && clip[0].isCopied === true) {
        console.log('item in clipboard exits = ' + clip[0].isCopied);
        clip[0].isCopied = false;
        clip.pop();
    }
    if (item.isCopied) {
        item.isCopied = false;
    }
    scope.state.itemRef = item;
    var dayNum = MyDates.getDateFromString(item.dayCode);
    scope.state.weekRef = setWeekRef(dayNum, scope);
    scope.state.dayRef = setDayRef(dayNum, scope);
}

module.exports = helperSelectItem;

//# sourceMappingURL=helperSelectItem.js.map