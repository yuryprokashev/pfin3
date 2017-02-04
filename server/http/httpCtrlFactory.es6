/**
 *Created by py on 30/11/2016
 */
'use strict';
module.exports = (httpService, config) => {
    const httpCtrl = {};

    httpCtrl.sendMessage = (message) => {
        let path = `/bot${config.token}/sendMessage`;
        return new Promise(
            (resolve, reject) => {
                httpService.post(path, message).then(
                    (response) => {
                        resolve(response);
                    },
                    (error) => {
                        reject(error);
                    }
                );
            }
        );

    };

    httpCtrl.setWebhook = (message) => {
        let path = `/bot${config.token}/setWebhook`;
        return new Promise(
            (resolve, reject) => {
                httpService.post(path, message).then(
                    (response) => {
                        // console.log('httpService resolved');
                        resolve(response);
                    },
                    (error) => {
                        reject(error);
                    }
                );
            }
        );

    };

    return httpCtrl;
};