/**
 *Created by py on 13/12/2016
 */
'use strict';
class Worker2 {

    constructor (id, commandId, bus) {
        this.id = id;
        this.bus = bus;
        this.commandId = commandId || undefined;
    };

    handle (topic, query, data) {
        let _this = this;
        return new Promise(
            (res, rej) => {

                let context;
                if(data) {
                    context = _this.createWriteContext(query, data);
                }
                else {
                    context = _this.createReadContext(query);
                }

                _this.subscribe(`${topic}-response`,
                    ((resolve, reject) => {
                    return (kafkaMessage) => {
                        _this.answer(kafkaMessage, resolve, reject);
                    }
                })(res, rej));

                _this.send(`${topic}-request`, context);
            }
        )

    };

// (function(s, http){
//     return function (event, args) {
//         handleItemDrop(event, args, s, http);
//     };
// })($scope, $http)

    answer (kafkaMessage, resolve, reject) {
        let context = JSON.parse(kafkaMessage.value);
        // check if context has been passed from service
        if(context === undefined) {
            reject({error: 'kafkaMessage contains no value'});
        }
        // filter only this worker response
        if(context.id === this.id) {
            if(context.response === undefined) {
                reject({error: 'context.response is empty'});
            }
            if(context.response.error !== undefined) {
                reject(context.response);
            }
            resolve(context.response);
        }
    };

    subscribe (topic, callback) {
        this.bus.subscribe(topic, callback);
    };

    send (topic, context) {
        this.bus.send(topic, context);
    };

    createReadContext (query) {
        return {
            id: this.id,
            request: {
                query: query
            },
            response: undefined
        }
    };

    createWriteContext (query, data) {
        return {
            id: this.id,
            request: {
                query: query,
                writeData: data
            },
            response: undefined
        }
    };
}
module.exports = Worker2;