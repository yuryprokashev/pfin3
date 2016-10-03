/**
 * Created by py on 19/09/16.
 */

"use strict";

const WorkerFactory = require('./WorkerFactory');
const MessagePayload = require('../../common/MessagePayload');
const ExpenseMessagePayload = require('../../common/ExpenseMessagePayload');
const Message = require('../../common/Message');
const guid = require('../../common/guid');
const MyDates = require('../../common/MyDates');

class Manager {
    constructor(){
        this.factory = new WorkerFactory();
        this.currentWorkers = new Map();
    }

    manage(request, response){
        // var _this = this;
        // function transformToRequest(worker, payload){
        //
        //     function findTargetMonthCode(monthCode, delta){
        //         let year = monthCode.substring(0,4);
        //         let month = monthCode.substring(4,6) || undefined;
        //         let day = monthCode.substring(6,8) || undefined;
        //         if(month !== undefined){
        //             let monthNum = Number(month) + delta;
        //             let newMonth = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
        //             return `${year}${newMonth}${day}`;
        //         }
        //         else {
        //             throw new Error('monthCode does not contain month (6 chars expected)');
        //         }
        //     }
        //     let requestLikePayload = {
        //         method: "POST",
        //         body: {}
        //     };
        //      let p = new MessagePayload(
        //          findTargetMonthCode(payload.dayCode, 1),
        //          {
        //              isPlan: true,
        //              isDeleted: payload.labels.isDeleted
        //          }
        //      );
        //     let emp = new ExpenseMessagePayload(
        //         p,
        //         payload.amount,
        //         `copy of ${payload.description}`,
        //         undefined
        //     );
        //     requestLikePayload.body = new Message(
        //         payload.userId,
        //         payload.sourceId,
        //         payload.type,
        //         emp,
        //         undefined,
        //         payload.commandId
        //     );
        //     return requestLikePayload;
        // } // not needed
        // function oneMessagePromiseFromPayload(message){
        //     console.log(message);
        //     let w = _this.factory.worker('message', message.commandId);
        //     let transformedPayload = transformToRequest(w, message);
        //     return w.handle(transformedPayload, response);
        // } // not needed
        // function payloadsReceivedCallback(payloads){
        //     // console.log(payloads.msg);
        //     let messages = payloads.msg.map(function(item){
        //         item.commandId = payloads.worker.commandId;
        //         return item;
        //     });
        //     let messagePromises = messages.map(
        //         oneMessagePromiseFromPayload
        //     );
        //     // _this.purge(payloads.worker.id);
        //     console.log('Message promises');
        //     console.log(messagePromises);
        //     return Promise.all(messagePromises);
        // } // not needed
        // function setWorker(workerType, query){
        //     let task = this.factory.worker(workerType, query.commandId);
        //     this.currentWorkers.set(task.id, task);
        //     return task.handle(query, response);
        // }
        if(this.isPayload(request)) {
            let getQuery = this.makeGetQueryFromRequest(request);
            let task1 = this.factory.worker('payload', undefined);
            this.currentWorkers.set(task1.id, task1);
            return task1.handle(getQuery, response);
        }
        else if(this.isMessage(request)) {
            let task1 = this.factory.worker('message', undefined);
            this.currentWorkers.set(task1.id, task1);
            return task1.handle(request, response);
        }
        else if(this.isCommandCopy(request)){
            let query = this.makeCopyQuery(request);
            let task = this.factory.worker('copyPayload', request.params.commandId);
            this.currentWorkers.set(task.id, task);
            return task.handle(query, response);
        }
        else if(this.isCommandClear(request)){
            let query = this.makeClearQuery(request);
            let task = this.factory.worker('clearPayload', request.params.commandId);
            this.currentWorkers.set(task.id, task);
            return task.handle(query, response);
        }
        else if(this.isGetMonthData(request)){
            let query = this.makeMonthDataQuery(request);
            let task = this.factory.worker('monthData', undefined);
            this.currentWorkers.set(task.id, task);
            return task.handle(query, response);

        }
    }

    makeMonthDataQuery(request){
        let q = {
            user: request.user._id.toString(),
            payloadType: Number(request.params.payloadType),
            sortOrder: {},
            targetPeriod: request.params.targetPeriod
        };
        return q;
    }

    makeGetQueryFromRequest(request){
        var getQuery = {
            user: request.user._id.toString(),
            payloadType: Number(request.params.payloadType),
            sortOrder: {}
        };

        if(this.isGetPayloadDay(request)){
            getQuery.dayCode = request.params.dayCode;
            getQuery.sortOrder[request.params.sortParam] = Number(request.params.sortOrder);
        }
        
        if(this.isGetPayloadMonth(request)){
            getQuery.monthCode = request.params.dayCode;
        }

        return getQuery;
    }

    makeCopyQuery(request){
        let q = {
            user: request.user._id.toString(),
            payloadType: Number(request.params.payloadType),
            sortOrder:{},
            targetPeriod: request.params.targetPeriod,
            sourcePeriod: request.params.sourcePeriod,
            commandType: request.params.commandType,
            occuredAt: MyDates.now()
        };
        return q;
    }

    makeClearQuery(request){
        let q = {
            user: request.user._id.toString(),
            payloadType: Number(request.params.payloadType),
            sortOrder:{},
            targetPeriod: request.params.targetPeriod,
            commandType: request.params.commandType,
            occuredAt: MyDates.now()
        };
        return q;
    }
    
    isGetPayloadDay(request){
        return request.params.dayCode.length === 8;
    }

    isGetPayloadMonth(request){
        return request.params.dayCode.length === 6;
    }

    isGetMonthData(request){
        let monthData = /monthData/;
        let payload = /payload/;
        return payload.test(request.url) && monthData.test(request.url);
    }
    
    isPayload(request){
        let payload = new RegExp("payload");
        let monthData = /monthData/;
        return payload.test(request.url) && !monthData.test(request.url);
    }

    isMessage(request){
        let message = new RegExp("message");
        return message.test(request.url);
    }

    isCommandCopy(request){
        let command = new RegExp("command");
        let type = /copy/;
        return command.test(request.url) && type.test(request.url);
    }
    
    isCommandClear(request){
        let command = new RegExp("command");
        let type = /clear/;
        return command.test(request.url) && type.test(request.url);
    }

    returnResult(result){
        result.worker.response.json(result.msg);
        purge(result.worker.id);
    }

    returnResultA(resultArray){
        let res = resultArray[0].worker.response;
        let monthCode = resultArray[0].msg.dayCode.substring(0,6);
        res.json({
            commandId: resultArray[0].worker.commandId,
            monthCode: monthCode
        });
    }

    returnCommandResult(result){
        result.worker.response.json(result.msg);
        this.purge(result.worker.id);
    }

    returnError(error){
        console.log(error);
        error.response.json({error: error});
        purge(error.worker.id);
    }

    purge(id){
        this.currentWorkers.delete(id);
    }

}

module.exports = Manager;