/**
 *Created by py on 01/11/2016
 */

'use strict';

var isMessageFormShown = require('./decideIsMessageFormShown');
var isCurrentMonthClicked = require('./decideIsCurrentMonthClicked');
var isContextMenuShown = require('./decideIsContextmenuShown');
var selectMonthAsync = require('./helperSelectMonthAsync');
var hideContextMenu = require('./helperHideContextMenu');

function handleClickedMonth(event, args, scope, http) {

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

//# sourceMappingURL=handleClickedMonth.js.map