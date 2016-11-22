/**
 *Created by py on 01/11/2016
 */

'use strict';

const isContextMenuShown = require('./decideIsContextmenuShown.es6');

function helperShowContextMenu(ctxMenu, scope) {
    scope.state.ctxMenuRef = ctxMenu;
    scope.state.ctxMenuRef.show();
}

module.exports = helperShowContextMenu;