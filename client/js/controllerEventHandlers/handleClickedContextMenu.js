/**
 *Created by py on 01/11/2016
 */
'use strict';

var isContextMenuShown = require('./decideIsContextmenuShown');
var isContextMenuOfCurrentMonthClicked = require('./decideIsContextMenuOfCurrentMonthClicked');
var hideContextMenu = require('./helperHideContextMenu');
var showContextMenu = require('./helperShowContextMenu');
var selectMonthAsync = require('./helperSelectMonthAsync');

function handleClickedContextMenu(event, args, scope, http) {
    if (isContextMenuShown(scope) && !isContextMenuOfCurrentMonthClicked(scope)) {
        hideContextMenu(scope);
        selectMonthAsync(args.ctxMenu.target, scope, http);
        showContextMenu(args.ctxMenu, scope);
    }

    if (isContextMenuShown(scope) && isContextMenuOfCurrentMonthClicked(scope)) {
        hideContextMenu(scope);
    }

    if (!isContextMenuShown(scope)) {
        selectMonthAsync(args.ctxMenu.target, scope, http);
        showContextMenu(args.ctxMenu, scope);
    }
}
module.exports = handleClickedContextMenu;

//# sourceMappingURL=handleClickedContextMenu.js.map