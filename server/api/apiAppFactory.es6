/**
 *Created by py on 15/11/2016
 */
'use strict';
module.exports = (apiController) => {
    const express = require('express');
    let apiApp = new express.Router();
    let payloadCtrl = apiController.payload;
    let messageCtrl = apiController.message;

    apiApp.get('/config/pusher', apiController.configPusher);
    apiApp.get('/me', apiController.me);
    apiApp.get('/payload/:dayCode/:sortParam/:sortOrder', payloadCtrl.getPayloads);
    apiApp.get('/command/:commandType/:targetPeriod/:sourcePeriod/:payloadType/:commandId', payloadCtrl.handleCommand);
    apiApp.get('/payload/monthData/:targetPeriod', payloadCtrl.getMonthData);
    apiApp.get('/payload/monthData/:startMonth/:endMonth', payloadCtrl.getMonthData);
    apiApp.post('/message/:t', messageCtrl.handleStructuredMessage);
    return apiApp;
};