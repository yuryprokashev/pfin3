'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by py on 18/09/16.
 */

var io = require('socket.io-client');
var PUSHER_HOST = 'http://localhost:50000';
// const PUSHER_HOST = "http://ec2-54-154-147-244.eu-west-1.compute.amazonaws.com:50000";

var PusherClient = function () {
    function PusherClient() {
        _classCallCheck(this, PusherClient);

        console.log(PUSHER_HOST);
        this.pushServer = { url: PUSHER_HOST };
        this.sockets = new Map();
    }

    _createClass(PusherClient, [{
        key: 'register',
        value: function register(id, callback) {
            var socket = io(this.pushServer.url, { multiplex: false });

            var _this = this;

            function handlePayloadDone(data) {
                console.log('this is push data');
                console.log(data);
                callback(data);
            }

            function setUniqueId(data) {
                console.log('socket connected');
                socket.emit('set-id', { _id: id });
                _this.sockets.set(id, socket);
                console.log(_this.sockets);
                socket.on('client-payload-new-' + id, handlePayloadDone);
            }

            function clearSocket(data) {
                console.log(data);
                _this.sockets.delete(data._id);
                console.log(_this.sockets);
            }

            socket.on('connect', setUniqueId);

            socket.on('reset-id', clearSocket);
        }
    }]);

    return PusherClient;
}();

module.exports = PusherClient;

//# sourceMappingURL=PusherClient2.js.map