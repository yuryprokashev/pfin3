/**
 * Created by py on 06/09/16.
 */
"use strict";
const Worker = require('./Worker.es6');
const guid = require('../helpers/guid.es6');

class WorkerFactory {
    constructor(bus) {
        this.bus = bus;
        this.currentWorkers = new Map();
    }

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

    log() {
        for(let w of this.currentWorkers) {
            console.log(`${JSON.stringify(w)} \n`);
        }
        console.log('-----------------\n');
    }
}

module.exports = WorkerFactory;