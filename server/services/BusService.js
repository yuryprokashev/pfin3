/**
 * Created by py on 11/08/16.
 */

var BusService;

var KafkaAdapter = require('./KafkaAdapter');
var MyDates = require('../../common/MyDates');

BusService = (function (adapter) {

    var log = [];

    return {
        send: function(topic, message) {
            // console.log(`bus sending message for ${topic}`);
            // console.log(message);
            // log.push({type: "sent", occuredAt: MyDates.now(), topic: topic, message: message});
            adapter.send(topic, {message: message});
        },
        subscribe: function(topic, callback) {
            // console.log(`bus registers for ${topic} with ${callback}`);
            // log.push({type: "subscribed", occuredAt: MyDates.now(), topic: topic, hanlder: callback });
            adapter.subscribe(topic, callback);
        },
        unsubscribe: function (topic, callback) {
            adapter.unsubscribe(topic, callback);
        },
        log: function () {
            console.log(log);
        }
    }
})(new KafkaAdapter());

module.exports = BusService;