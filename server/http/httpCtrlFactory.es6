/**
 *Created by py on 30/11/2016
 */
'use strict';
module.exports = (httpService, config) => {
    const httpCtrl = {};

    httpCtrl.sendMessage = (message) => {
        let path = `/bot${config.bot.token}/sendMessage`;
        // console.log('POSTING TO HTTP SERVICE');
        httpService.post(path, message);
    };

    return httpCtrl;
};