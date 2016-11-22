/**
 *Created by py on 01/11/2016
 */

'use strict';

const isMessageFormShown = require('./decideIsMessageFormShown.es6');
const isCurrentMonthClicked = require('./decideIsCurrentMonthClicked.es6');
const isContextMenuShown = require('./decideIsContextmenuShown.es6');
const selectMonthAsync = require('./helperSelectMonthAsync.es6');
const hideContextMenu = require('./helperHideContextMenu.es6');

function handleClickedMonth (event, args, scope, http) {

    if (isMessageFormShown(scope)) {
        scope.state.isFormShown = false;
    }

    if (isCurrentMonthClicked(args.month, scope) && isContextMenuShown(scope)) {
        hideContextMenu(scope.state.ctxMenuRef);
    } else if (!isCurrentMonthClicked(args.month, scope) && isContextMenuShown(scope)) {
        selectMonthAsync(args.month, scope, http);
        hideContextMenu(scope);
    } else {
        selectMonthAsync(args.month, scope, http);
    }
}
module.exports = handleClickedMonth;