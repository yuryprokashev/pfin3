/**
 * Created by py on 09/08/16.
 */


var KafkaAdapter;

const MyDates = require('../../client/js/MyDates');
const wagner = require('wagner-core');
const Config = wagner.invoke( function(Config) { return Config });

KafkaAdapter = function () {

    var self = this;

    var kafka = require('kafka-node');
    var kafkaClient = new kafka.Client(`${Config.kafka.hostURL}:2181/`, Config.kafka.hostName);

    var setUpProducer = function (kafkaClient) {
        self.producer = new kafka.Producer(kafkaClient, {partitionerType: Config.kafka.partitionerType});
        self.producer.on('ready', function () {
            console.log('NodeJS Kafka Producer Ready...');
        });
        self.producer.on('error', function(data){
            console.log(kafkaClient);
            console.log(data);
            throw new Error('Kafka disconnected');
        })
    };

    var setUpConsumer = function(kafkaClient){
        self.consumer = new kafka.Consumer(kafkaClient,[]);

        self.consumer.on('error', function (error) {
            console.log('consumer error:');
            console.log(error);
            console.log('-------------');
        })
    };

    // param: String topic - topic, where to put the new message
    // param: Object message - arbitrary Message {message: <whatever>} format
    // function: sends message.<whatever> property to Kafka withing 'topic'
    // return: void
    var send = function (topic, message) {
        // const KeyedMessage = kafka.KeyedMessage;
        var payload = [];
        // var km = new KeyedMessage(topic, JSON.stringify(message.message));
        payload.push(
            {
                topic: topic,
                messages: JSON.stringify(message.message)
                // messages: km,
            });
        self.producer.send(payload, function (err, data) {
            if(err) {
                console.log("error");
                console.log(err);
            }
            if(data){
                console.log("data sent");
                console.log(data);
            }
        })
    };

    // param: String - topic
    // param: Function callback - the function to be executed after message will arrive
    // function: tell Kafka that you want to get messages for this topic
    var subscribe = function (topic, callback) {
        var topics = [
            {topic:topic, partition:0},
            {topic:topic, partition:1},
            {topic:topic, partition:2},
            {topic:topic, partition:3},
            {topic:topic, partition:4},
            {topic:topic, partition:5}
        ];
        self.consumer.addTopics(topics, function (err, added) {
            if(err){
                // console.log("error");
                // console.log(err);
            }
            if(added){
                // console.log("added");
                // console.log(added);
            }
        });
        self.consumer.on('message', function (message) {
            if(message.topic === topic) {
                callback(message);
            }
        });
    };

    var unsubscribe = function (topic, callback) {
        self.consumer.removeTopics([topic], function(err, removed){
            if(err){
                console.log('error');
                console.log(err);
            }
            if(removed) {
                // console.log('removed');
                // console.log(removed);
            }
            callback();
        });
    };

    // MAIN LOOP
    setUpProducer(kafkaClient);
    setUpConsumer(kafkaClient);

    // MODIFY BELOW VERY CAREFULLY!!!
    return {
        send: send,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    }
};

module.exports = KafkaAdapter;