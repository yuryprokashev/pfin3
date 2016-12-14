/**
 * Created by py on 06/09/16.
 */
"use strict";
// const PayloadWorker = require('./PayloadWorker.es6');
// const MessageWorker = require('./MessageWorker.es6');
// const CopyPayloadWorker = require('./CopyPayloadWorker.es6');
// const ClearPayloadWorker = require('./ClearPayloadWorker.es6');
// const MonthDataWorker = require('./MonthDataWorker.es6');
// const FindUserWorker = require('./FindUserWorker.es6');
// const UpdateUserWorker = require('./UpdateUserWorker.es6');
// const BotMessageWorker = require('./BotMessageWorker.es6');
const Worker = require('./Worker2.es6');
const guid = require('../helpers/guid.es6');

class WorkerFactory {
    constructor(bus) {
        this.bus = bus;
        // this.availableWorkerTypes = {
        //     payload: PayloadWorker,
        //     message: MessageWorker,
        //     copyPayload: CopyPayloadWorker,
        //     clearPayload: ClearPayloadWorker,
        //     monthData: MonthDataWorker,
        //     findUser: FindUserWorker,
        //     updateUser: UpdateUserWorker,
        //     botMessage: BotMessageWorker
        // };
        this.currentWorkers = new Map();
    }

    // worker(type, commandId){
    //     let id = guid();
    //     let newWorker = new this.availableWorkerTypes[type](id, commandId, this.bus);
    //     this.currentWorkers.set(id, newWorker);
    //     return newWorker;
    // }

    worker(commandId) {
        let newWorker, id;
        id = guid();
        newWorker = new Worker(id, commandId, this.bus);
        this.currentWorkers.set(id, newWorker);
        return newWorker;
    }

    purge(id) {
        this.currentWorkers.delete(id);
    }
}

module.exports = WorkerFactory;