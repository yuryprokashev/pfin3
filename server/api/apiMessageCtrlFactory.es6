/**
 *Created by py on 22/11/2016
 */
'use strict';
module.exports = (workerFactory) => {
    const apiMessageCtrl = {};

    apiMessageCtrl.handleFreeMessage = (request, response) => {
        console.log(JSON.stringify(request));
        response.status(200);
    };

    apiMessageCtrl.handleStructuredMessage = (request, response) => {
        let worker, query, data;

        worker = workerFactory.worker();
        query = {};
        data = request.body;
        data.userId = data.user;
        delete data['user'];

        worker.handle('create-message', query, data).then(
            (result) => {
                response.json(result);
                workerFactory.purge(worker.id);
            },
            (error) => {
                response.json(error);
                workerFactory.purge(worker.id);
            }
        );
    };

    return apiMessageCtrl;
};