/**
 *Created by py on 01/11/2016
 */

'use strict';

var UIItem = require('../UIItem');

function handleDoubleClickedDay(event, args, scope) {
    var day = args.day;
    var isFuture = day.html.isFuture;
    var item = new UIItem(1, 0, "New item", day.timeWindow, { isPlan: isFuture, isDeleted: false }, false);
    scope.state.itemRef = item;
    day.addItem(item);
    scope.$apply(function () {
        scope.state.dayRef.update();
        scope.view.expensePoster.update();
    });
}

module.exports = handleDoubleClickedDay;

//# sourceMappingURL=handleDoubleClickedDay.js.map