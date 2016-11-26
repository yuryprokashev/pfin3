/**
 * Created by py on 06/09/16.
 */
"use strict";
const Worker = require('./Worker.es6');
// const Bus = require('../services/BusService.es6');

class MessageWorker extends Worker{
    constructor(id, commandId, bus){
        super(id, commandId, bus);
    }

    handle (request, response){
        super.extract(request);
        let _this = this;
        this.response = response;

        function handleNewMessageAsync(resolve, reject) {

            function isMyResponse(msg){
                let responseRequestId = JSON.parse(msg.value).requestId;
                return responseRequestId === _this.busValue.requestId;
            }

            function isErrors(msg){
                return JSON.parse(msg.value).responseErrors.length !== 0;
            }

            function assembleAck(msg) {
                return {
                    _id: _this.parseMsgValue(msg).responsePayload.id,
                    dayCode: _this.parseResponsePayload(msg, "payload").dayCode
                };
            }

            function assembleErrors(msg) {
                return JSON.parse(msg.value).responseErrors;
            }

            function sendAckMessageSaved(msg) {
                if(isMyResponse(msg)) {
                    if(isErrors(msg)){
                        reject(assembleErrors(msg));
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

module.exports = MessageWorker;