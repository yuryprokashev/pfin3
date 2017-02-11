/**
 *Created by py on 15/11/2016
 */

"use strict";
module.exports = (workerService, kafkaService, config) =>{
    const apiController = {};
    const status = require('http-status');
    const apiPayloadCtrlFactory = require('./apiPayloadCtrlFactory.es6');
    const apiMessageCtrlFactory = require('./apiMessageCtrlFactory.es6');

    apiController.payload = apiPayloadCtrlFactory(workerService, kafkaService);
    apiController.message = apiMessageCtrlFactory(workerService, kafkaService);

    apiController.configPusher = (request, response) => {
        if(!request.user) {
            return response.status(status.UNAUTHORIZED).json({error: 'not logged in'});
        }
        response.json(config);
    };

    apiController.me = (request, response) => {
        if(!request.user) {
            return response.status(status.UNAUTHORIZED).json({error: 'not logged in'});
        }
        response.json({user: request.user});
    };

    return apiController;
};
