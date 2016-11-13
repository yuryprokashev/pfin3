/**
 *Created by py on 13/11/2016
 */

'use strict';

const kafka = require('kafka-node');

class KafkaAdapter2 {
    constructor(kafkaHost, clientName, partitionerType){
        this.kafkaClient = new kafka.Client(`${kafkaHost}:2181/`, clientName);
        this.clientName = clientName;
        this.partitionerType = partitionerType;
    }
    send(topic, message){
        console.log(`${this.clientName}`);
        console.log(`${JSON.stringify(message)}`);
        let producer = new kafka.Producer(this.kafkaClient, {partitionerType: this.partitionerType});
        producer.id = (new Date().valueOf()).toString();
        producer.on('ready', onProducerReady);
        function onProducerReady (){
            let payload = [];
            payload.push(
                {
                    topic: topic,
                    messages: JSON.stringify(message)
                }
            );
            producer.send(payload, onProducerSent);
            function onProducerSent(err, data){
                if(err){
                    console.log('producer send error');
                    console.log(err);
                }
                if(data){
                    // _this.producers.delete(producer.id);
                }
            }
        }
        producer.on('error', onProducerError);
        function onProducerError(err){
                console.log('producer error');
                console.log(err);
                console.log('-------------');
        }
        // this.producers.set(producer.id, producer);

    }
    subscribe(topic, callback){
        let consumer = new kafka.Consumer(this.kafkaClient, []);
        function onConsumerError(error) {
            console.log('consumer error:');
            console.log(error);
            console.log('-------------');
        }
        consumer.on('error', onConsumerError);

        let topics = (function(qty){
            let t = [];
            for(let i = 0; i < qty; i++){
                t.push({topic: topic, partition: i});
            }
            return t;
        })(6);
        consumer.addTopics(topics, onTopicsAdded);
        function onTopicsAdded(err, added){
            if(err){
                console.log('consumer adding topics failed');
                console.log(err);
            }
        }
        consumer.on('message', onConsumerMessage);
        function onConsumerMessage(m){
            if(m.topic === topic){
                callback(m);
            }
        }
    }
}

module.exports = KafkaAdapter2;
