/**
 *Created by py on 22/11/2016
 */
'use strict';
module.exports = (workerFactory) => {
    const apiMessageCtrl = {};

    apiMessageCtrl.handleFreeMessage = (request, response) => {
        console.log(JSON.stringify(request));
    };

    apiMessageCtrl.handleStructuredMessage = (request, response) => {
        let worker = workerFactory.worker('message', undefined);
        worker.handle(request, response).then(
            (result) => {
                send(result, workerFactory);
            },
            (error) => {
                send(error, workerFactory);
            }
        );
    };
    let send = (data, workerFactory) => {
        data.worker.response.json(data.msg);
        workerFactory.purge(data.worker.id);
    };
    return apiMessageCtrl;
};