/**
 *Created by py on 08/02/2017
 */
'use strict';
const guid = require('../helpers/guid.es6');
const workerFactory = require('./workerFactory2.es6');

module.exports = (workerStorage) => {

    let workerService = {};

    workerService.worker = (kafkaService) => {
        let worker, workerId;
        workerId = guid();
        worker = workerFactory(workerId, kafkaService);
        workerStorage.set(workerId, worker);
        return worker;
    };

    workerService.purge = (workerId) => {
        workerStorage.delete(workerId);
    };
    return workerService;
};