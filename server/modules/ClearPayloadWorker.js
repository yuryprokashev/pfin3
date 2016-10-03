/**
 * Created by py on 28/09/16.
 */
"use strict";

const Worker = require('./Worker');
const Bus = require('../services/BusService');

class ClearPayloadWorker extends Worker {
    constructor(id, commandId){
        super(id, commandId);
    }

    handle(query, response) {
        query.requestId = this.id;
        query.commandId = this.commandId;
        this.response = response;
        var _this = this;

        function sendCopyCommandAsync (resolve, reject){

            function isMyResponse(msg){
                let responseRequestId = JSON.parse(msg.value).requestId;
                return responseRequestId === _this.busValue.requestId;
            }

            function isErrors(msg){
                return JSON.parse(msg.value).responseErrors.length !== 0;
            }

            function assembleErrors(msg) {
                return JSON.parse(msg.value).responseErrors;
            }

            function assembleAck(msg){
                return {
                    target: JSON.parse(msg.value).responsePayload
                }
            }

            function sendCopySuccess(msg){
                console.log(msg);
                if(isMyResponse(msg)){
                    if(isErrors(msg)){
                        reject(assembleErrors(msg));
                    }
                    else {
                        resolve({worker: _this, msg: assembleAck(msg)});
                    }
                }
            }

            Bus.subscribe('clear-payload-response', sendCopySuccess);
            Bus.send('clear-payload-request', query);
        }
        return new Promise(sendCopyCommandAsync);

    }
}

module.exports = ClearPayloadWorker;