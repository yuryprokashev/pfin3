/**
 * Created by py on 06/09/16.
 */
"use strict"
const Worker = require('./Worker');

const Bus = require('../services/BusService');

const guid = require('../../client/js/guid');

class PayloadWorker extends Worker {
    constructor(id, commandId) {
        super(id,commandId);
    }

    handle(getQuery, response) {
        getQuery.requestId = this.id;
        this.response = response;
        var _this = this;

        return new Promise(function(resolve, reject){

            Bus.subscribe('payload-response', function (msg) {
                var responseRequestId = JSON.parse(msg.value).requestId;
                if(responseRequestId === _this.id) {
                    resolve({worker: _this, msg: getPayloadFromKafkaMessage(msg)});
                }
            });

            Bus.send('payload-request', getQuery);

        });
    }
}

// @param: KafkaMessage msg
// @function: parse Kafka message and return JSON representation of it's payload
// @return: Object in JSON format.
var getPayloadFromKafkaMessage = function (msg) {
    return JSON.parse(msg.value).payload;
};

module.exports = PayloadWorker;
