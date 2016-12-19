/**
 *Created by py on 01/11/2016
 */

'use strict';
const MyDates = require('../MyDates.es6');
const setWeekRef = require('./helperSetWeekRef.es6');
const guid = require('../guid.es6');
const updateDayFromServer = require('./helperUpdateDayFromServer.es6');

function handleClickedItemBtn (event, args, scope, http) {

    var pushCallback = function pushCallback(pushData) {
        console.log(`this is push arrived ${pushData}`);
        var dayNum = MyDates.getDateFromString(pushData);
        var week = setWeekRef(dayNum, scope);
        var day = week.getDayRef(pushData);
        updateDayFromServer(day, scope, http);
    };

    var saveCallback = function saveCallback(response) {
        scope.state.itemRef.setItemFromForm(args.form);
        scope.state.itemRef.isItemProcessing = true;
        scope.state.itemRef.isSaved = false;
        scope.state.isFormShown = false;
        scope.view.calendarView.update();
        scope.view.expensePoster.update();
        scope.$emit('monthdata::change', {month:scope.state.monthRef});
    };

    var token = guid();
    scope.pushListener.register(token, pushCallback);
    var message = args.form.assembleMessage(args.btn, token);
    http.post(args.form.postUrl, message).then(saveCallback);
}

module.exports = handleClickedItemBtn;