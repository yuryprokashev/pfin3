/**
 * Created by py on 18/09/16.
 */

const io = require('socket.io-client');

class PusherClient {
    constructor() {
        this.pushServer = {url: `http://pf.edufun.me`};
        this.sockets = new Map();

    }

    register(id, callback){
        var socket = new io.Socket(this.pushServer.url, {port: 50000, multiplex: false});
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