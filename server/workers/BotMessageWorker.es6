/**
 *Created by py on 29/11/2016
 */

"use strict";
const Worker = require('./Worker.es6');

class BotMessageWorker extends Worker{
    constructor(id, commandId, bus) {
        super(id, commandId, bus);
    }

    handle(item){
        let _this = this;
        this.busValue.requestPayload = item;

        function handleNewMessageAsync(resolve, reject) {

            function assembleAck(msg) {
                return {
                    _id: _this.parseMsgValue(msg).responsePayload.id,
                    dayCode: _this.parseResponsePayload(msg, "payload").dayCode
                };
            }

            function sendAckMessageSaved(msg) {
                if(_this.isMyResponse(msg)) {
                    if(_this.isErrors(msg)){
                        reject(_this.assembleErrors(msg));
                    }
                    else {
                        resolve({worker: _this, msg: assembleAck(msg)});
                    }
                }
            }

            _this.subscribe('message-done', sendAckMessageSaved);

            _this.send('message-new', _this.busValue);
        }

        return new Promise(handleNewMessageAsync);
    }
}

module.exports = BotMessageWorker;