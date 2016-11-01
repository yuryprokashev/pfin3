/**
 *Created by py on 01/11/2016
 */
'use strict';

function setContextMenuOptions(scope) {
    scope.view.monthSwitch.months.forEach(function (item) {
        item.ctxMenu.setOptionsAsync();
    });
}
module.exports = setContextMenuOptions;

//# sourceMappingURL=helperSetContextMenuOptions.js.map