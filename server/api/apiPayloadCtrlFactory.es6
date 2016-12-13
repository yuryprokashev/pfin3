/**
 *Created by py on 22/11/2016
 */
'use strict';
module.exports = (workerFactory) => {
    const apiPayloadCtrl = {};

    apiPayloadCtrl.getPayloads = (request, response) => {

        let query = {
            user: request.user._id.toString(),
            payloadType: Number(request.params.payloadType),
            sortOrder: {},
        };

        switch (request.params.dayCode.length) {
            case 8:
                query.dayCode = request.params.dayCode;
                query.sortOrder[request.params.sortParam] = Number(request.params.sortOrder);
                break;
            case 6:
                query.monthCode = request.params.dayCode;
        }
        let worker = workerFactory.worker("payload", undefined);
        worker.handle(query, response).then(
            (result) => {
                send(result, workerFactory);
            },
            (error) => {
                send(error, workerFactory);
            }
        )

    };

    apiPayloadCtrl.handleCommand = (request, response) => {
        if (/copy/.test(request.url)) {
            handleCopyCommand(request,response);
        }
        else if(/clear/.test(request.url)) {
            handleClearCommand(request, response)
        }
    };

    let handleCopyCommand = (request, response) => {
        let query = {
            user: request.user._id.toString(),
            payloadType: Number(request.params.payloadType),
            sortOrder:{},
            targetPeriod: request.params.targetPeriod,
            sourcePeriod: request.params.sourcePeriod,
            commandType: request.params.commandType,
            occuredAt: new Date().valueOf()
        };
        let worker = workerFactory.worker("copyPayload", request.params.commandId);
        worker.handle(query, response).then(
            (result) => {
                send(result, workerFactory);
            },
            (error) => {
                send(error, workerFactory);
            }
        )
    };

    let handleClearCommand = (request, response) => {
        let query = {
            user: request.user._id.toString(),
            payloadType: Number(request.params.payloadType),
            sortOrder:{},
            targetPeriod: request.params.targetPeriod,
            commandType: request.params.commandType,
            occuredAt: new Date().valueOf()
        };
        let worker = workerFactory.worker("clearPayload", request.params.commandId);
        worker.handle(query, response).then(
            (result) => {
                send(result, workerFactory);
            },
            (error) => {
                send(error, workerFactory);
            }
        )

    };

    apiPayloadCtrl.getMonthData = (request, response) => {
        // let query = {
        //     user: request.user._id.toString(),
        //     payloadType: Number(request.params.payloadType),
        //     sortOrder: {},
        //     targetPeriod: request.params.targetPeriod
        // };
        let worker = workerFactory.worker('monthData', undefined);
        worker.handle('get-month-data', request).then(
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

    let send = (data, workerFactory) => {
        data.response.json(data.msg);
        workerFactory.purge(data.worker.id);
    };

    return apiPayloadCtrl;

};