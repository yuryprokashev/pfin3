/**
 *Created by py on 31/10/2016
 */

'use strict';

const updateDayFromServer = require('./helperUpdateDayFromServer.es6');
const guid = require('../guid.es6');

function handleItemDrop(event, args, scope, http) {
    // -- запомнить, откуда был drag
    let dragSource = scope.state.dayRef;
    // -- выбрать в UI день, куда был drop.
    scope.state.dayRef = args.dropTargetDay;
    // -- изменить у выбранного item день со старого на новый.
    scope.state.itemRef.dayCode = args.dropTargetDay.dayCode;
    // -- показать item  полупрозрачным - он ведь еще не сохранился
    scope.state.itemRef.isSaved = false;
    scope.$apply(function(){
        args.dropTargetDay.update();
        dragSource.update();
        scope.view.calendarView.update();
    });
    scope.view.expensePoster.update();
    // -- собрать Message из item.
    let clientToken = guid();
    let message = scope.view.expensePoster.assembleMessage('save', clientToken);
    // -- послать Message на сервер POST /message/:dayCode, dayCode - это 'dropTarget'.
    // -- По приходу 200 на POST надо выполнить saveCallback:
    let saveCallback = function(){
        //     --- зарегистрировать в scope.pushListener новый push и ждать, пока он придет.
        scope.pushListener.register(clientToken, pushCallback);
    };

    let pushCallback = function (pushData) {
        updateDayFromServer(dragSource, scope, http);
        updateDayFromServer(args.dropTargetDay, scope, http);
    };
    http.post(scope.view.expensePoster.postUrl, message).then(saveCallback);
}

module.exports = handleItemDrop;
    
