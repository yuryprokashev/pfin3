/**
 * Created by py on 19/09/16.
 */
"use strict"

const Worker = require('./Worker');
const Bus = require('../services/BusService');
const WorkerFactory = require('./WorkerFactory');

const workerFactory = new WorkerFactory();

class CommandWorker extends Worker {
    constructor(id){
        super(id);
    }
    handle(request, response){

        function handleCopyCommandAsync(resolve, reject){
            // get the payloads via 'payload-request'
            var payloadWorker = workerFactory.worker('payload');
            // var payloads = [];
            payloadWorker.handle(request, response)
                .then(
                    (result)=>{
                        // payloads.push(result);
                        resolve(result);

                    },
                    (error)=>{
                        reject({error: error});
                    }
                );
        }

        return new Promise(handleCopyCommandAsync);
        // var messageWorker = workerFactory.worker('message');

        // wait while everything arrives
        // for every payload execute transform
        // pack every payload to message
        // send via Bus 'message-new'
        // respond with {commandType: "copy", code: monthCode}

        // Pusher service
        // wait while all payloads arrive
        // reply with push, saying that this daycode or monthcode is ready.
    }
}

module.exports = CommandWorker;