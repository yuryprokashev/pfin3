/**
 *Created by py on 31/10/2016
 */
'use strict';

var helperSelectItem = require('./helperSelectItem');

function handleItemDragStart(event, args, scope) {
  helperSelectItem(args.item, scope);
  scope.view.expensePoster.update();
}

module.exports = handleItemDragStart;

//# sourceMappingURL=handleItemDragStart.js.map