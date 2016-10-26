/**
 * Created by py on 06/09/16.
 */
"use strict"
const PayloadWorker = require('./PayloadWorker');
const MessageWorker = require('./MessageWorker');
const CopyPayloadWorker = require('./CopyPayloadWorker');
const ClearPayloadWorker = require('./ClearPayloadWorker');
const MonthDataWorker = require('./MonthDataWorker');
const guid = require('../../client/js/guid');

class WorkerFactory {
    constructor() {
        this.availableWorkerTypes = {
            payload: PayloadWorker,
            message: MessageWorker,
            copyPayload: CopyPayloadWorker,
            clearPayload: ClearPayloadWorker,
            monthData: MonthDataWorker
        };

        this.currentWorkers = {};
    }

    worker(type, commandId){
        var id = guid();
        var newWorker = new this.availableWorkerTypes[type](id, commandId);
        this.currentWorkers[id] = newWorker;
        return newWorker;
    }

}

module.exports = WorkerFactory;