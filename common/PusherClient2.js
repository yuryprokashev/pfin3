/**
 * Created by py on 18/09/16.
 */

const io = require('socket.io-client');
const PUSHER_PORT = 50000;
const PUSHER_HOST = "http://localhost";
// const PUSHER_HOST = "http://ec2-54-154-147-244.eu-west-1.compute.amazonaws.com";

class PusherClient {
    constructor() {
        this.pushServer = {url: PUSHER_HOST};
        this.sockets = new Map();

    }

    register(id, callback){
        var socket = io(this.pushServer.url, {port: PUSHER_PORT, multiplex: false});
        var _this = this;

        function handlePayloadDone(data){
            console.log(`this is push data`);
            console.log(data);
            callback(data);
        }

        function setUniqueId(data) {
            socket.emit('set-id', {_id: id});

            // _this.sockets[id] = socket;
            _this.sockets.set(id, socket);
            console.log(_this.sockets);
            socket.on(`client-payload-new-${id}`, handlePayloadDone);
        }

        function clearSocket(data){
            console.log(data);
            _this.sockets.delete(data._id);
            console.log(_this.sockets);
        }

        socket.on('connect', setUniqueId);

        socket.on('reset-id', clearSocket);
        
    }

}

module.exports = PusherClient;