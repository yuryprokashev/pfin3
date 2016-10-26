/**
 * Created by py on 27/09/16.
 */

"use strict";

const Worker = require('./Worker');
const Bus = require('../services/BusService');

class CopyPayloadWorker extends Worker {
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
                    target: JSON.parse(msg.value).responsePayload[0].monthCode
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

            Bus.subscribe('copy-payload-response', sendCopySuccess);
            Bus.send('copy-payload-request', query);
        }
        return new Promise(sendCopyCommandAsync);

    }
}

module.exports = CopyPayloadWorker;