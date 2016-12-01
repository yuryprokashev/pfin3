/**
 *Created by py on 26/11/2016
 */
"use strict";
const Worker = require('./Worker.es6');
class UpdateUserWorker extends Worker{
    constructor(id, commandId, bus){
        super(id, commandId, bus);
    }
    handle(query, response) {
        query.requestId = this.id;
        query.commandId = this.commandId;
        this.response = response;
        let _this = this;

        function findUser(resolve, reject) {

            function assembleAck(msg){
                return JSON.parse(msg.value).user;
            }
            function send(msg) {
                if(_this.isMyResponse(msg)){
                    if(_this.isErrors(msg)){
                        reject(_this.assembleErrors(msg));
                    }
                    else {
                        // console.log(`UpdateUserWorker ${JSON.stringify(msg)}`);
                        resolve({worker: _this, msg: assembleAck(msg)});
                    }
                }
            }

            _this.subscribe('user-find-one-and-update-response', send);
            _this.send('user-find-one-and-update-request', query);

        }
        return new Promise(findUser);
    }

}
module.exports = UpdateUserWorker;