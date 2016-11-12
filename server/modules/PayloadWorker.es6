/**
 * Created by py on 06/09/16.
 */
"use strict";
const Worker = require('./Worker2.es6');

// const Bus = require('../services/BusService.es6');

const guid = require('../guid.es6');

class PayloadWorker extends Worker {
    constructor(id, commandId, bus) {
        super(id,commandId, bus);
    }

    handle(getQuery, response) {
        getQuery.requestId = this.id;
        this.response = response;
        var _this = this;

        return new Promise(function(resolve, reject){

            _this.subscribe('payload-response', function (msg) {
                var responseRequestId = JSON.parse(msg.value).requestId;
                if(responseRequestId === _this.id) {
                    resolve({worker: _this, msg: getPayloadFromKafkaMessage(msg)});
                }
            });

            _this.send('payload-request', getQuery);

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
