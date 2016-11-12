/**
 * Created by py on 29/09/16.
 */
"use strict";

const Worker = require('./Worker2.es6');
// const Bus = require('../services/BusService.es6');

class MonthDataWorker extends Worker {
    constructor(id, commandId, bus){
        super(id, commandId, bus);
    }
    handle(query, response){
        // console.log(query);
        query.requestId = this.id;
        query.commandId = this.commandId;
        this.response = response;
        var _this = this;

        function askMonthData(resolve, reject) {

            function isMyResponse(msg){
                console.log(`MonthDataWorker ${msg}`);
                if(JSON.parse(msg.value) === null){
                    return 0;
                }
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
                return JSON.parse(msg.value).responsePayload;
            }
            function sendMonthData(msg) {
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

            _this.subscribe('get-month-data-response', sendMonthData);
            _this.send('get-month-data-request', query);
            
        }
        return new Promise(askMonthData);
    }
    
}
module. exports = MonthDataWorker;