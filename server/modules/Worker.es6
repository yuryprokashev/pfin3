/**
 * Created by py on 06/09/16.
 */
"use strict"
class Worker {
    constructor(id, commandId){
        this.id = id;
        this.commandId = commandId || undefined;
        this.busValue = {
            requestId: id,
            requestPayload: {},
            requestErrors:[]
        }
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
        return responseRequestId === self.busValue.requestId;
    }

}

module.exports = Worker;