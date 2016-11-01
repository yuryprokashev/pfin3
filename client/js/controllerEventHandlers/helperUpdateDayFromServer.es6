/**
 *Created by py on 31/10/2016
 */

'use strict';

const UIItem = require('../UIItem');

function helperUpdateDateFromServer(day, scope, http) {
    http.get(day.getUrl).then(function (res) {
        var items = res.data;
        var result = [];
        items.forEach(function (item) {
            var transformedItem = UIItem.transformToUIItem(item);
            transformedItem.isItemProcessing = false;
            transformedItem.isSaved = true;
            result.push(transformedItem);
        });
        scope.$applyAsync(function () {
            day.html.items = result;
            day.update();
        });
    });
}

module.exports = helperUpdateDateFromServer;