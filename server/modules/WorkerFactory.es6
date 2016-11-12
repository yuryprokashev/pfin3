/**
 * Created by py on 06/09/16.
 */
"use strict";
const PayloadWorker = require('./PayloadWorker.es6');
const MessageWorker = require('./MessageWorker.es6');
const CopyPayloadWorker = require('./CopyPayloadWorker.es6');
const ClearPayloadWorker = require('./ClearPayloadWorker.es6');
const MonthDataWorker = require('./MonthDataWorker.es6');
const guid = require('../guid.es6');
const KafkaAdapter = require('../services/KafkaAdapter2.es6');
const EventEmitter = require('events').EventEmitter;

class WorkerFactory extends EventEmitter{
    constructor(bus) {
        super();
        this.bus = bus;
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
        var newWorker = new this.availableWorkerTypes[type](id, commandId, this.bus);
        this.currentWorkers[id] = newWorker;
        return newWorker;
    }

}

module.exports = WorkerFactory;