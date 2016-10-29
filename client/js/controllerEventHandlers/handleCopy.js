/**
 *Created by py on 29/10/2016
 */
'use strict';

function handleCopy(event, args, scope) {
    console.log('copy');
    if (scope.state.itemRef !== undefined) {
        scope.state.clipboard.push(scope.state.itemRef);
        scope.$apply(function () {
            scope.state.itemRef.isCopied = true;
            scope.state.isFormShown = false;
            scope.view.expensePoster.update();
        });
    }
}

module.exports = handleCopy;

//# sourceMappingURL=handleCopy.js.map