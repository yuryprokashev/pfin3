/**
 *Created by py on 13/12/2016
 */
/**
* Worker is responsible for sending queries to particular Kafka topic
 * and outputs the result of these queries.
 * Worker 'handle' method, which returns Promise.
 * 'handle' method gets three things as input:
 * 1) Topic Prefix
 * Required.
 * The Kafka Topic prefix (one without '-request' or '-response').
 * The one which this Worker instance will subscribe and will send the Query and Data.
 * If undefined, Worker.handle will resolve to {error: 'topic is not defined'}
 *
 * 2) Query object.
 * Required.
 * Object with data fields for selection and sorting.
 * If undefined, Worker.handle will resolve to {error: 'query is not defined'}
 *
 * 3) Data object.
 * Optional. Object with data to write into DB (createOrUpdate operation).
 *
 * Returns Promise, that will resolve to MontData object: {total: {plan: 100, fact: 200}}.
 * Promise will be rejected with errors in following cases:
 * 1) Payload service replied with KafkaMessage with no Context:
 * {error: 'kafkaMessage contains no value'}
 *
 * 2) Payload service replied with KafkaMessage with Context, but it has empty response property:
 * {error: 'context.response is empty'}
 *
 * 3) Topic is undefined or not string: {error: 'topic is not defined or not string'}
 *
 * 4) Query is undefined or not object: {error: 'query is not defined or not object'}
*/

'use strict';
class Worker {

    constructor (id, commandId, bus) {
        this.id = id;
        this.bus = bus;
        this.commandId = commandId || undefined;
    };

    handle (topicPrefix, query, data) {
        let _this = this;
        return new Promise(
            (res, rej) => {

                let context;
                if(topicPrefix === undefined || typeof topicPrefix !== 'string') {
                    rej({error: 'topic is not defined or not string'});
                }
                if(query === undefined || typeof query !== 'object') {
                    rej({error: 'query is not defined or not object'});
                }
                if(data) {
                    context = _this.createWriteContext(query, data);
                }
                else {
                    context = _this.createReadContext(query);
                }

                _this.subscribe(`${topicPrefix}-response`,
                    ((resolve, reject) => {
                    return (kafkaMessage) => {
                        _this.answer(kafkaMessage, resolve, reject);
                    }
                })(res, rej));

                _this.send(`${topicPrefix}-request`, context);
            }
        )

    };

    // answer (kafkaMessage, resolve, reject) {
    //     let context = JSON.parse(kafkaMessage.value);
    //     // check if context has been passed from service
    //     if(context === undefined) {
    //         reject({error: 'kafkaMessage contains no value'});
    //     }
    //     // filter only this worker response
    //     if(context.id === this.id) {
    //         if(context.response === undefined) {
    //             reject({error: 'context.response is empty'});
    //         }
    //         if(context.response.error !== undefined) {
    //             reject(context.response);
    //         }
    //         resolve(context.response);
    //     }
    // };

    answer (kafkaMessage, resolve, reject) {
        console.log('before the answer');
        console.log(kafkaMessage);
        let context = JSON.parse(kafkaMessage.value);
        // check if context has been passed from service
        if(context === undefined) {
            reject({error: 'kafkaMessage contains no value'});
        }

        if(context.response === undefined) {
            reject({error: 'context.response is empty'});
        }
        if(context.response.error !== undefined) {
            reject(context.response);
        }
        resolve(context.response);
    };

    //
    // subscribe (topic, callback) {
    //     this.bus.subscribe(topic, true, (kafkaMessage) => {
    //         let kafkaMessageSignature;
    //         kafkaMessageSignature = JSON.parse(kafkaMessage.value).id;
    //         if(this.id === kafkaMessageSignature) {
    //             console.log(`my message ${kafkaMessageSignature} -> executing callback ${callback.name}`);
    //             callback(kafkaMessage);
    //         }
    //         else {
    //             console.log(`not my message ${kafkaMessageSignature} -> no callback executed`);
    //         }
    //     });
    // };

    subscribe (topic, callback) {
        this.bus.subscribe(topic, true, callback);
    };

    send (topic, context) {
        this.bus.send(topic, true, context);
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
module.exports = Worker;