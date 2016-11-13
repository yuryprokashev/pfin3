/**
 *Created by py on 01/11/2016
 */
'use strict';
function decideIsContextMenuOfCurrentMonthClicked(scope) {
    return scope.state.ctxMenuRef.target === scope.state.monthRef;
}

module.exports = decideIsContextMenuOfCurrentMonthClicked;