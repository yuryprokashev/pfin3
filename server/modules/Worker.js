/**
 * Created by py on 06/09/16.
 */

import guid from '../../common/guid';

class Worker {
    constructor(id){
        this.id = id;
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

}

module.exports = Worker;