/**
 *Created by py on 15/11/2016
 */

"use strict";
module.exports = (kafkaBus) =>{

    let deliveredMessages;

    deliveredMessages = new Map();

    let kafkaService = {};

    kafkaService.send = (topic, message)=>{
        let onProducerError = (err) => {
            console.log('producer error');
            console.log(err);
            console.log('--------------');
        };
        let onProducerSent = (err, data) => {
            if(err){
                console.log('producer sent error');
                console.log(err);
                console.log('-------------------');
            }
            if(data){
                console.log('producer sent success');
                console.log(data);
                console.log('-------------------');
            }
        };
        // producer.on('ready', function(){
        //     console.log(JSON.stringify(message));
        //     producer.send([{topic: topic, messages: JSON.stringify(message)}], onProducerSent);
        // });
        kafkaBus.producer.on('error', onProducerError);
        kafkaBus.producer.send([{topic: topic, messages: JSON.stringify(message)}], onProducerSent);
    };

    kafkaService.subscribe = (topic, callback) => {
        let onTopicsAdded = (err, added) => {
            if(err){
                console.log('consumer failed to add topics');
                console.log(err);
                console.log('-------------');
            }
        };
        let onConsumerMessage = (message) => {
            let mKey;
            mKey = `${message.topic}-${message.partition}-${message.offset}`;
            if(message.topic === topic && !deliveredMessages.has(mKey)){
                callback(message);
                if(deliveredMessages.size > 3) {
                    let keys = deliveredMessages.keys();
                    // keys.sort();
                    console.log(keys);
                }
                deliveredMessages.set(mKey, new Date().valueOf());

            }
        };
        let onConsumerError = (err) => {
            console.log('consumer default error');
            console.log(err);
            console.log('-------------');
        };
        let topics = (function(qty){
            let t = [];
            for(let i = 0; i < qty; i++){
                t.push({topic: topic, partition: i});
            }
            return t;
        })(6);
        kafkaBus.consumer.addTopics(topics, onTopicsAdded);
        kafkaBus.consumer.on('message', onConsumerMessage);
        kafkaBus.consumer.on('error', onConsumerError);
    };

    return kafkaService;
};