/**
 *Created by py on 31/10/2016
 */

'use strict';

var sendCommandAsync = require('./helperSendCommandAsync');
var commandCallback = require('./helperCommandCallback');
var startCommandProcessing = require('./helperStartCommandProcessing');

function handleClickedCtxMenuOption(event, args, scope, http) {
    sendCommandAsync(args.option, http, function (s, h) {
        return function (response) {
            commandCallback(response, s, h);
        };
    }(scope, http));
    startCommandProcessing(scope);
}

module.exports = handleClickedCtxMenuOption;

//# sourceMappingURL=handleClickedCtxMenuOption.js.map