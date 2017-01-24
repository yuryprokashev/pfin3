/**
 *Created by py on 30/11/2016
 */
'use strict';
module.exports = (httpClient) => {
    const httpService = {};

    // httpService.post = (path, data) => {
    //     httpClient.post(path, data, (response)=>{
    //         response.setEncoding('utf8');
    //         response.on('error', (error) => {
    //             console.log(`post to ${path} failed with error ${error}`);
    //         });
    //         response.on('end', () => {
    //             console.log(response);
    //         });
    //     });
    // };

    httpService.post = (path, data) => {
        return new Promise(
            (resolve, reject) => {
                httpClient.post(path, data, (response)=>{

                    response.setEncoding('utf8');

                    response.on('error', (error) => {
                        console.log(`post to ${path} failed with error ${error}`);
                        reject(error);
                    });
                    response.on('end', () => {
                        console.log('response ended...');
                    });
                    resolve(response);
                });
            }
        );
    };

    return httpService;
};