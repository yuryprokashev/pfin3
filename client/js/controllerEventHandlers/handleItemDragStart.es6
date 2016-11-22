/**
 *Created by py on 31/10/2016
 */
'use strict';

const helperSelectItem = require('./helperSelectItem.es6');

function handleItemDragStart(event, args, scope) {
    helperSelectItem(args.item, scope);
    scope.view.expensePoster.update();
}

module.exports = handleItemDragStart;