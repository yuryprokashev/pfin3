/**
 *Created by py on 13/11/2016
 */

'use strict';

const kafka = require('kafka-node');

class KafkaAdapter3 {
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

        function onProducerReady (){
            let payload = [];
            payload.push(
                {
                    topic: topic,
                    messages: JSON.stringify(message)
                }
            );

            function onProducerSent(err, data){
                if(err){
                    console.log('producer send error');
                    console.log(err);
                }
                if(data){
                    // _this.producers.delete(producer.id);
                }
            }

            producer.send(payload, onProducerSent);
        }

        function onProducerError(err){
                console.log('producer error');
                console.log(err);
                console.log('-------------');
        }

        producer.on('error', onProducerError);

        producer.on('ready', onProducerReady);

    }
    subscribe(topic, callback){
        let consumer = new kafka.Consumer(this.kafkaClient, []);
        function onConsumerError(error) {
            console.log('consumer error:');
            console.log(error);
            console.log('-------------');
        }

        let topics = (function(qty){
            let t = [];
            for(let i = 0; i < qty; i++){
                t.push({topic: topic, partition: i});
            }
            return t;
        })(6);

        function onTopicsAdded(err, added){
            if(err){
                console.log('consumer adding topics failed');
                console.log(err);
            }
        }

        function onConsumerMessage(m){
            if(m.topic === topic){
                callback(m);
            }
        }

        consumer.on('error', onConsumerError);

        consumer.addTopics(topics, onTopicsAdded);

        consumer.on('message', onConsumerMessage);
    }
}

module.exports = KafkaAdapter3;
