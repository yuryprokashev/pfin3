/**
 *Created by py on 05/11/2016
 */
'use strict';

const ClientApiService = require('./ClientApiService.es6');
const parseProcessArgs = require('./parseProcessArgs.es6');
const Config = require('./Config.es6');
const KafkaAdapter = require('./services/KafkaAdapter2.es6');
const guid = require('./guid.es6');

const KAFKA_TEST = "54.154.211.165";
const KAFKA_PROD = "54.154.226.55";
let args = parseProcessArgs();

let kafkaHost = (function(bool){
    let result = bool ? KAFKA_PROD : KAFKA_TEST;
    console.log(result);
    return result;
})(args[0].isProd);
var bus = new KafkaAdapter(kafkaHost, 'Client-Api-Service', 2);


bus.producer.on('ready', function(){
    let requestId = guid();
    var app = new ClientApiService(bus);
    bus.subscribe('get-config-response', app.configure);
    app.emit('get-config-request', {requestId: requestId});
    bus.send('get-config-request', {requestId: requestId});
});
