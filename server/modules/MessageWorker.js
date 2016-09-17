/**
 * Created by py on 06/09/16.
 */

import Worker from './Worker';

import Bus from '../services/BusService';

class MessageWorker extends Worker{
    constructor(id){
        super(id);
    }

    handle (request, response){

        super.extract(request);
        // console.log(this.busValue);
        var self = this;

        function handleNewMessageAsync(resolve, reject) {

            function isMyResponse(msg){
                let responseRequestId = JSON.parse(msg.value).requestId;
                return responseRequestId === self.busValue.requestId;
            }

            function isErrors(msg){
                return JSON.parse(msg.value).responseErrors.length !== 0;
            }

            function assembleAck(msg) {
                return {
                    _id: self.parseMsgValue(msg).responsePayload.id,
                    dayCode: self.parseResponsePayload(msg, "payload").dayCode
                };
            }

            function assembleErrors(msg) {
                return JSON.parse(msg.value).responseErrors;
            }

            function sendAckMessageSaved(msg) {
                console.log(msg);
                if(isMyResponse(msg)) {
                    if(isErrors(msg)){
                        reject(assembleErrors(msg));
                    }
                    else {
                        resolve(assembleAck(msg));
                    }
                }
            }

            Bus.subscribe('message-done', sendAckMessageSaved);

            Bus.send('message-new', self.busValue);
        }

        return new Promise(handleNewMessageAsync);
    }
}

module.exports = MessageWorker;