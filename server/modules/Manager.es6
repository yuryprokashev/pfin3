/**
 * Created by py on 19/09/16.
 */

"use strict";

const WorkerFactory = require('./WorkerFactory.es6');
const MessagePayload = require('../../client/js/MessagePayload.es6');
const ExpenseMessagePayload = require('../../client/js/ExpenseMessagePayload.es6');
const Message = require('../../client/js/Message.es6');
const guid = require('../guid.es6');
const MyDates = require('../../client/js/MyDates.es6');

class Manager {
    constructor(bus){
        this.factory = new WorkerFactory(bus);
        this.currentWorkers = new Map();
    }

    manage(request, response){
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