/**
 *Created by py on 15/11/2016
 */

'use strict';
module.exports = (kafkaHost, clientName) => {
    const Kafka = require('kafka-node');
    const kafkaClient = new Kafka.Client(`${kafkaHost}:2181/`, clientName);
    // kafkaClient.producer = (partitionerType) => {
    //     let producer = new Kafka.Producer(kafkaClient, {partitionerType: partitionerType});
    //     console.log(producer.ready);
    //     return producer;
    // };
    //
    // kafkaClient.consumer = () => {
    //     let consumer = new Kafka.Consumer(kafkaClient, []);
    //     return consumer;
    //
    // };
    console.log(kafkaClient);
    kafkaClient.producer = new Kafka.Producer(kafkaClient, {partitionerType: 2});
    kafkaClient.consumer = new Kafka.Consumer(kafkaClient, []);

    return kafkaClient;
};