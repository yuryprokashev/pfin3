/**
 *Created by py on 30/11/2016
 */

'use strict';
module.exports = (hostConfig) => {
    const https = require('https');
    const httpClient = {};

    httpClient.post = (path, data, responseCallback) => {
        let postData = JSON.stringify(data);
        let options = {
            protocol: hostConfig.protocol,
            hostname: hostConfig.hostUrl,
            port: hostConfig.port,
            path: path,
            headers: {
                'Content-Type': hostConfig.contentType,
                'Content-Length': Buffer.byteLength(postData)
            },
            method: 'POST'
        };
        let request = https.request(options, responseCallback);

        request.on('error', (error)=>{
            console.log(`problem with request: ${error.message}`);
        });
        request.write(postData);
        // console.log(request);
        request.end();

    };

    httpClient.get = () => {

    };

    return httpClient;
};