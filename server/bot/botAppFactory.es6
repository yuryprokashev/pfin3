/**
 *Created by py on 29/11/2016
 */
'use strict';
module.exports = (botCtrl) => {
    const express = require('express');
    let botApp = new express.Router();
    botApp.post('/updates', botCtrl.handleUpdates);
    return botApp;
};