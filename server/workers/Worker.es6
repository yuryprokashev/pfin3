/**
 *Created by py on 08/11/2016
 */
"use strict";
// const EventEmitter = require('events').EventEmitter;

class Worker {
    constructor(id, commandId, bus){
        this.id = id;
        this.commandId = commandId || undefined;
        this.busValue = {
            requestId: id,
            requestPayload: {},
            requestErrors:[]
        };
        this.bus = bus;
    }

    handle(request) {

    }

    extract (request) {
        function isPOST(){
            return request.body !== undefined && request.method === 'POST';
        }

        function isGET() {
            return request.method === "GET";
        }

        if(isGET()){
            this.busValue.requestPayload = request.params;
            return this;
        }

        if(isPOST()) {
            this.busValue.requestPayload = request.body;
            return this;
        }
    }

    parseMsgValue(msg){
        return JSON.parse(msg.value);
    }

    parseResponsePayload(msg, key) {
        return JSON.parse(JSON.parse(msg.value).responsePayload[key]);
    }

    isMyResponse(msg){
        let responseRequestId = JSON.parse(msg.value).requestId;
        return responseRequestId === this.busValue.requestId;
    }

    isErrors (msg) {
        return JSON.parse(msg.value).errorName !== undefined;
    }

    assembleErrors(msg) {
        return JSON.parse(msg.value).errorName;
    }

    subscribe(topic, callback){
        this.bus.subscribe(topic, callback);
    }
    send(topic, message){
        this.bus.send(topic, message);
    }




}

module.exports = Worker;