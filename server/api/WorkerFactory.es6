/**
 * Created by py on 06/09/16.
 */
"use strict";
const PayloadWorker = require('./workers/PayloadWorker.es6');
const MessageWorker = require('./workers/MessageWorker.es6');
const CopyPayloadWorker = require('./workers/CopyPayloadWorker.es6');
const ClearPayloadWorker = require('./workers/ClearPayloadWorker.es6');
const MonthDataWorker = require('./workers/MonthDataWorker.es6');
const guid = require('../helpers/guid.es6');
class WorkerFactory {
    constructor(bus) {
        this.bus = bus;
        this.availableWorkerTypes = {
            payload: PayloadWorker,
            message: MessageWorker,
            copyPayload: CopyPayloadWorker,
            clearPayload: ClearPayloadWorker,
            monthData: MonthDataWorker
        };
        this.currentWorkers = new Map();
    }

    worker(type, commandId){
        let id = guid();
        let newWorker = new this.availableWorkerTypes[type](id, commandId, this.bus);
        this.currentWorkers.set(id, newWorker);
        return newWorker;
    }

    purge(id) {
        this.currentWorkers.delete(id);
    }
}

module.exports = WorkerFactory;