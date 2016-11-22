/**
 *Created by py on 31/10/2016
 */
'use strict';

var guid = require('../guid.es6');
function helperSendCommandAsync(option, http, callback) {
    var cmdId = guid();
    // $scope.pushListener.register(cmdId, getDaysAsync);
    // console.log(option.getUrl + '/' + cmdId);
    http.get(option.getUrl + '/' + cmdId).then(function (response) {
        callback(response);
    });
}

module.exports = helperSendCommandAsync;

//# sourceMappingURL=helperSendCommandAsync.js.map