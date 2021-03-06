/**
 * Created by py on 18/09/16.
 */

const io = require('socket.io-client');
// const PUSHER_HOST = 'http://localhost:50000';
// const PUSHER_HOST = "https://54.154.147.244:50000";
// const PUSHER_HOST = "http://pf.edufun.me:50000";

class PusherClient {
    constructor(http) {
        http.get('/browser/api/v1/config/pusher').then(
            (result) => {
                this.pushServer = {url: result.data.host};
                this.sockets = new Map();
            }
        )
    }

    register(id, callback){
        let socket = io(this.pushServer.url, {multiplex: false});
        console.log(socket);

        let _this = this;

        function handlePayloadDone(data){
            // console.log(`this is push data`);
            // console.log(data);
            callback(data);
        }

        function setUniqueId(data) {
            // console.log('socket connected');
            socket.emit('set-id', {_id: id});
            _this.sockets.set(id, socket);
            // console.log(_this.sockets);
            socket.on(`client-payload-new-${id}`, handlePayloadDone);
        }

        function clearSocket(data){
            // console.log(data);
            _this.sockets.delete(data._id);
            // console.log(_this.sockets);
        }

        socket.on('connect', setUniqueId);

        socket.on('reset-id', clearSocket);
        
    }

}


module.exports = PusherClient;