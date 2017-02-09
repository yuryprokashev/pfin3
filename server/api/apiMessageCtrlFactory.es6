/**
 *Created by py on 22/11/2016
 */
'use strict';
module.exports = (workerService, kafkaService) => {
    const apiMessageCtrl = {};

    apiMessageCtrl.handleFreeMessage = (request, response) => {
        console.log(JSON.stringify(request));
        response.status(200);
    };

    apiMessageCtrl.handleStructuredMessage = (request, response) => {
        let worker, query, data;

        worker = workerService.worker(kafkaService);
        query = {};
        data = request.body;
        data.userId = data.user;
        delete data['user'];

        worker.handle('create-message', query, data).then(
            (result) => {
                response.json(result);
                workerService.purge(worker.id);
            },
            (error) => {
                response.json(error);
                workerService.purge(worker.id);
            }
        );
    };

    return apiMessageCtrl;
};