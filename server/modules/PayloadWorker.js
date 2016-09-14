/**
 * Created by py on 06/09/16.
 */

import Worker from './Worker';

import Bus from '../services/BusService';

import guid from '../../common/guid';

class PayloadWorker extends Worker {
    constructor(id) {
        super(id);
    }

    handle(request, response) {
        let params = super.extract(request);
        var requestId = guid();

        var promise = new Promise(function(resolve, reject){
            // setTimeout(function(){
            //     resolve({wow: 'this is promise'});
            // }, 300);

            Bus.subscribe('payload-response', function (msg) {
                var responseRequestId = JSON.parse(msg.value).requestId;
                if(responseRequestId === requestId) {
                    resolve(getPayloadFromKafkaMessage(msg));
                }
            });

            var getQuery = {
                requestId: requestId,
                user: request.user._id.toString(),
                dayCode: request.params.dayCode,
                payloadType: Number(request.params.payloadType),
                sortOrder: {}
            };
            getQuery.sortOrder[request.params.sortParam] = Number(request.params.sortOrder);

            Bus.send('payload-request', getQuery);

        });
        
        return promise;
    }
}

// @param: KafkaMessage msg
// @function: parse Kafka message and return JSON representation of it's payload
// @return: Object in JSON format.
var getPayloadFromKafkaMessage = function (msg) {
    return JSON.parse(msg.value).payload;
};

module.exports = PayloadWorker;

// if(isNoUser === false) {
//     var Bus = require('./services/BusService');
//     var requestId = require('../common/guid')();
//     // console.log('request id in payload-request');
//     // console.log(requestId);
//
//     Bus.subscribe('payload-response', function (msg) {
//         // console.log('request id in payload-response');
//         // console.log(msg.value.requestId);
//         // console.log(JSON.parse(msg.value).requestId);
//         var responseRequestId = JSON.parse(msg.value).requestId;
//         if(responseRequestId === requestId) {
//             res.json(getPayloadFromKafkaMessage(msg));
//         }
//         Bus.unsubscribe('payload-response', function(){});
//     });
//     var getQuery = {
//         requestId: requestId,
//         user: req.user._id.toString(),
//         dayCode: req.params.dayCode,
//         payloadType: Number(req.params.payloadType)
//     };
//     getQuery.sortOrder = {};
//     getQuery.sortOrder[req.params.sortParam] = Number(req.params.sortOrder);
//     // console.log(getQuery);
//     Bus.send('payload-request', getQuery);
// }
