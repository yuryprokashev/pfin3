/**
 *Created by py on 01/11/2016
 */
'use strict';
const isContextMenuShown = require('./decideIsContextmenuShown.es6');
const isContextMenuOfCurrentMonthClicked = require('./decideIsContextMenuOfCurrentMonthClicked.es6');
const hideContextMenu = require('./helperHideContextMenu.es6');
const showContextMenu = require('./helperShowContextMenu.es6');
const selectMonthAsync = require('./helperSelectMonthAsync.es6');


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