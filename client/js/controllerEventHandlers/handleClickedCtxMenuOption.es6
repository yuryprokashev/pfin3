/**
 *Created by py on 31/10/2016
 */

'use strict';

const sendCommandAsync = require('./helperSendCommandAsync');
const commandCallback = require('./helperCommandCallback');
const startCommandProcessing = require('./helperStartCommandProcessing');

function handleClickedCtxMenuOption (event, args, scope, http) {
    sendCommandAsync(args.option, http,
        (function(s,h){
            return function(response){
                commandCallback(response, s, h)
            }
        })(scope, http)
    );
    startCommandProcessing(scope);
}

module.exports = handleClickedCtxMenuOption;

