/**
 * Created by py on 06/09/16.
 */

import PayloadWorker from './PayloadWorker';

import MessageWorker from './MessageWorker';

import guid from '../../common/guid';

class WorkerFactory {
    constructor() {
        this.availableWorkerTypes = {
            payload: PayloadWorker,
            message: MessageWorker
        };

        this.currentWorkers = {};
    }

    worker(type){
        var id = guid();
        var newWorker = new this.availableWorkerTypes[type](id);
        this.currentWorkers[id] = newWorker;
        return newWorker;
    }

    purge(id) {
        delete this.currentWorkers[id];
    }
}

module.exports = WorkerFactory;