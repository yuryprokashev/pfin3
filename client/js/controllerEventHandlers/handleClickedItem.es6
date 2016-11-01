/**
 *Created by py on 01/11/2016
 */
'use strict';
const selectItem = require('./helperSelectItem');
const hideContextMenu = require('./helperHideContextMenu');
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