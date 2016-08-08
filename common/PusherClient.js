/**
 * Created by py on 13/07/16.
 */

var PusherClient;

// param: String apiKey - Pusher API Key
// function: object constructor
// return: PusherClient object
PusherClient = (function(apiKey){

    var pusher = new Pusher(apiKey, {
        encrypted: true
    });

    var channels = {};

    // param: String channel - channel name to listen
    // param: String event - event name to listen
    // param: Function callback - method to execute when event arrives
    // function: registers the callback for specified channel and event
    // return: true, if function ended successfully
    var subscribe = function (channel, event, callback) {
        if(!channels[channel]) {
            channels[channel] = [];
        }
        channels[channel].push({event: event, callback: callback});

        var c = pusher.subscribe(channel);
        c.bind(event, callback);
        return true;
    };

    var getChannels = function(){
        return channels;
    };

    return {
        subscribe: subscribe,
        channels: getChannels
    }
})('aaa12f45b280acb74218');

module.exports = PusherClient;