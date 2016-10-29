/**
 *Created by py on 29/10/2016
 */
'use strict';
const guid = require('../guid');
const UIItem = require('../UIItem');

function handlePaste(event, args, scope, http){
    console.log('paste');
    let item = scope.state.clipboard[0]; // взять item из clipboard
    //item.isCopied = false; // - оригинальный item меняет класс на copied-false
    let itemCopy = UIItem.copy(item); // создать точно такой же item, но копию
    itemCopy.isSaved = false; // -- Его стиль - будто он еще не сохранен.
    itemCopy.dayCode = scope.state.dayRef.timeWindow; // изменить у копии день на тот, что сейчас выделен
    scope.$apply(function(){
        scope.state.dayRef.addItem(itemCopy);
        scope.state.dayRef.update();
    }); // добавить копию в выделенный день и отразить изменения в UI

    scope.state.itemRef = itemCopy; // положить копию в itemRef, ибо оттуда ее возьмет expensePoster
    scope.view.expensePoster.update(); // и вот он ее взял
    let clientToken = guid();
    let message = scope.view.expensePoster.assembleMessage('save', clientToken); // собираем сообщение
    let saveCallback = function(){
        scope.state.itemRef = undefined;
        scope.pushListener.register(clientToken, pushCallback);
    }; // описываем, что делать, когда save пройдеь успешно
    let pushCallback = function(pushData){
        http.get(scope.state.dayRef.getUrl).then(function(res){
            var items = res.data;
            var result = [];
            items.forEach(function (item) {
                var transformedItem = UIItem.transformToUIItem(item);
                transformedItem.isItemProcessing = false;
                transformedItem.isSaved = true;
                result.push(transformedItem);
            });
            scope.$applyAsync(function () {
                scope.state.dayRef.html.items = result;
                scope.state.dayRef.update();
            });
        });
        scope.$emit('monthdata::change', {month: scope.state.monthRef});
    }; // описываем, что делать, когда придет пуш, что сообщение обработано.
    http.post(scope.view.expensePoster.postUrl, message).then(saveCallback); // отправляем сообщение с копией
}

module.exports = handlePaste;