/**
 *Created by py on 31/10/2016
 */

'use strict';

function decideIsContextMenuShown(scope) {
    return scope.state.ctxMenuRef !== undefined && scope.state.ctxMenuRef.html.isShown === true;
}

module.exports = decideIsContextMenuShown;