/**
 *Created by py on 31/10/2016
 */

'use strict';

const isContextMenuShown = require('./decideIsContextmenuShown');

function helperHideContextMenu(scope) {
    if (isContextMenuShown(scope)) {
        scope.state.ctxMenuRef.hide();
        scope.state.ctxMenuRef = undefined;
    }
}

module.exports = helperHideContextMenu;