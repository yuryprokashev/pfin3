/**
 *Created by py on 22/11/2016
 */
'use strict';
module.exports = (workerFactory) => {
    const apiPayloadCtrl = {};

    apiPayloadCtrl.getPayloads = (request, response) => {

        let worker, query, data;

        worker = workerFactory.worker();
        query = {
            userId: request.user._id.toString(),
            // type: Number(request.params.payloadType),
            sortOrder: {},
            'labels.isDeleted': false
        };

        switch (request.params.dayCode.length) {
            case 8:
                query.dayCode = request.params.dayCode;
                query.sortOrder[request.params.sortParam] = Number(request.params.sortOrder);
                break;
            case 6:
                query.monthCode = request.params.dayCode;
        }

        data = undefined;

        worker.handle('get-payload', query, data).then(
            (result) => {
                response.json(result);
                workerFactory.purge(worker.id);
            },
            (error) => {
                response.json(error);
                workerFactory.purge(worker.id);
            }
        )

    };

    apiPayloadCtrl.handleCommand = (request, response) => {
        if (/copy/.test(request.url)) {
            handleCopyCommand(request,response);
        }
        else if(/clear/.test(request.url)) {
            handleClearCommand(request, response);
        }
    };

    let handleCopyCommand = (request, response) => {

        let worker, query, data;

        worker = workerFactory.worker();

        query = {
            userId: request.user._id.toString(),
            type: Number(request.params.payloadType),
            monthCode: request.params.sourcePeriod,
            'labels.isDeleted': false
        };

        data = {
            monthCode: request.params.targetPeriod,
            occurredAt: new Date().valueOf(),
            commandId: request.params.commandId
        };

        worker.handle('copy-payload', query, data).then(
            (result) => {
                response.json(result);
                workerFactory.purge(worker.id);
            },
            (error) => {
                response.json(error);
                workerFactory.purge(worker.id);
            }
        )
    };

    let handleClearCommand = (request, response) => {
        let worker, query, data;

        worker = workerFactory.worker();

        query = {
            userId: request.user._id.toString(),
            type: Number(request.params.payloadType),
            monthCode: request.params.targetPeriod,
            'labels.isDeleted': false
        };

        data = undefined;

        worker.handle('clear-payload', query,data).then(
            (result) => {
                response.json(result);
                workerFactory.purge(worker.id);
            },
            (error) => {
                response.json(error);
                workerFactory.purge(worker.id);
            }
        )

    };

    apiPayloadCtrl.getMonthData = (request, response) => {

        let worker, query, data;

        worker = workerFactory.worker();
        console.log(`created new worker ${worker.id}`);

        query = [
            {$match: {userId: request.user._id, "labels.isDeleted": false, monthCode: { $gte: request.params.startMonth, $lte: request.params.endMonth}}},
            {$project: {_id:1, amount:1, monthCode: 1, isPlanned: {$cond:{if:{$eq:["$labels.isPlan",true]}, then:"plan", else:"fact"}}}},
            {$match:  {monthCode: { $gte: request.params.startMonth, $lte: request.params.endMonth}}},
            {$project: { _id:1, amount:1,isPlanned: "$isPlanned"}},
            {$group: {_id: "$isPlanned", total: {$sum: "$amount"}}}];

        data = undefined;

        worker.handle('agg-month-data', query, data).then(
            (result) => {
                console.log(`returned from worker ${worker.id}`);
                console.log(result);
                response.json(result);
                workerFactory.purge(worker.id);
            },
            (error) => {
                response.json(error);
                workerFactory.purge(worker.id);
            }
        );
    };

    return apiPayloadCtrl;

};