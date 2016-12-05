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
        console.log(request);
        request.end();

    };

    httpClient.get = () => {

    };

    return httpClient;
};

//--------------------------------------
// var postData = querystring.stringify({
//     'msg' : 'Hello World!'
// });

// var options = {
//     hostname: 'www.google.com',
//     port: 80,
//     path: '/upload',
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Content-Length': Buffer.byteLength(postData)
//     }
// };

// var req = http.request(options, (res) => {
//     console.log(`STATUS: ${res.statusCode}`);
//     console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//         console.log(`BODY: ${chunk}`);
//     });
//     res.on('end', () => {
//         console.log('No more data in response.');
//     });
// });
