/**
 *Created by py on 01/11/2016
 */
'use strict';

function handleCompiledItem(event, args, scope) {
    if (scope.state.itemRef === args.item) {
        scope.state.isFormShown = true;
        scope.view.expensePoster.update();
    }
}
module.exports = handleCompiledItem;

//# sourceMappingURL=handleCompiledItem.js.map