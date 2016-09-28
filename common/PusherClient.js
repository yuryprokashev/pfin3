/**
 * Created by py on 13/07/16.
 */

var PusherClient;

// param: String id - id of the message for which we want to be notified back
// function: object constructor
// return: PusherClient object
PusherClient = function(id, callback) {
    var io = require('socket.io-client');

    var socket = io('http://localhost');

    socket.on("connect", function(data){
        socket.emit("set-id", {_id: id});
    });

    socket.on("client-payload-new-1", function (data) {
        callback(data);
    });

    console.log("Pusher Client with token " + id + " is initialized");


    var sockets = {};

    // param: String channel - channel name to listen
    // param: String event - event name to listen
    // param: Function callback - method to execute when event arrives
    // function: registers the callback for specified channel and event
    // return: true, if function ended successfully
    var subscribe = function (channel, event, callback) {
        // if(!channels[channel]) {
        //     channels[channel] = [];
        // }
        // channels[channel].push({event: event, callback: callback});
        //
        // var c = pusher.subscribe(channel);
        // c.bind(event, callback);
        // return true;
    };

    var getChannels = function(){
        // return channels;
    };

    return {
        subscribe: subscribe,
        channels: getChannels
    }
};

module.exports = PusherClient;