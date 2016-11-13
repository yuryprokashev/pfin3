/**
 *Created by py on 01/11/2016
 */
'use strict';
const isContextMenuShown = require('./decideIsContextmenuShown');
const isContextMenuOfCurrentMonthClicked = require('./decideIsContextMenuOfCurrentMonthClicked');
const hideContextMenu = require('./helperHideContextMenu');
const showContextMenu = require('./helperShowContextMenu');
const selectMonthAsync = require('./helperSelectMonthAsync');


function handleClickedContextMenu (event, args, scope, http){
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