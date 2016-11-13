/**
 *Created by py on 01/11/2016
 */
'use strict';

var selectItem = require('./helperSelectItem');
var hideContextMenu = require('./helperHideContextMenu');
function handleClickedItem(event, args, scope) {

    selectItem(args.item, scope);

    scope.state.isFormShown = true;

    hideContextMenu(scope);

    scope.$apply(function () {
        scope.view.calendarView.update();
        scope.view.expensePoster.update();
    });
}
module.exports = handleClickedItem;

//# sourceMappingURL=handleClickedItem.js.map