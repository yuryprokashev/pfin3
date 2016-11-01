/**
 *Created by py on 01/11/2016
 */

'use strict';

const isMessageFormShown = require('./decideIsMessageFormShown');
const isCurrentMonthClicked = require('./decideIsCurrentMonthClicked');
const isContextMenuShown = require('./decideIsContextmenuShown');
const selectMonthAsync = require('./helperSelectMonthAsync');
const hideContextMenu = require('./helperHideContextMenu');

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