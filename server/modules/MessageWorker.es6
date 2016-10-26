/**
 * Created by py on 06/09/16.
 */
"use strict"
const Worker = require('./Worker');
const Bus = require('../services/BusService');

class MessageWorker extends Worker{
    constructor(id, commandId){
        super(id, commandId);
    }

    handle (request, response){
        super.extract(request);
        var self = this;
        this.response = response;

        function handleNewMessageAsync(resolve, reject) {

            function isMyResponse(msg){
                let responseRequestId = JSON.parse(msg.value).requestId;
                return responseRequestId === self.busValue.requestId;
            }

            function isErrors(msg){
                return JSON.parse(msg.value).responseErrors.length !== 0;
            }

            function assembleAck(msg) {
                return {
                    _id: self.parseMsgValue(msg).responsePayload.id,
                    dayCode: self.parseResponsePayload(msg, "payload").dayCode
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
                        resolve({worker: self, msg: assembleAck(msg)});
                    }
                }
            }

            Bus.subscribe('message-done', sendAckMessageSaved);

            Bus.send('message-new', self.busValue);
        }

        return new Promise(handleNewMessageAsync);
    }
}

module.exports = MessageWorker;