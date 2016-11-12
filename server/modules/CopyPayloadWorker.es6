/**
 * Created by py on 27/09/16.
 */

"use strict";

const Worker = require('./Worker2.es6');
// const Bus = require('../services/BusService.es6');

class CopyPayloadWorker extends Worker {
    constructor(id, commandId, bus){
        super(id, commandId, bus);
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

            _this.subscribe('copy-payload-response', sendCopySuccess);
            _this.send('copy-payload-request', query);
        }
        return new Promise(sendCopyCommandAsync);

    }
}

module.exports = CopyPayloadWorker;