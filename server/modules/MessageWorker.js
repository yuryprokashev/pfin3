/**
 * Created by py on 06/09/16.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Worker = require('./Worker');
var Bus = require('../services/BusService');

var MessageWorker = function (_Worker) {
    _inherits(MessageWorker, _Worker);

    function MessageWorker(id, commandId) {
        _classCallCheck(this, MessageWorker);

        return _possibleConstructorReturn(this, (MessageWorker.__proto__ || Object.getPrototypeOf(MessageWorker)).call(this, id, commandId));
    }

    _createClass(MessageWorker, [{
        key: 'handle',
        value: function handle(request, response) {
            _get(MessageWorker.prototype.__proto__ || Object.getPrototypeOf(MessageWorker.prototype), 'extract', this).call(this, request);
            var self = this;
            this.response = response;

            function handleNewMessageAsync(resolve, reject) {

                function isMyResponse(msg) {
                    var responseRequestId = JSON.parse(msg.value).requestId;
                    return responseRequestId === self.busValue.requestId;
                }

                function isErrors(msg) {
                    return JSON.parse(msg.value).responseErrors.length !== 0;
                }

                function assembleAck(msg) {
                    return {
                        _id: self.parseMsgValue(msg).responsePayload.id,
                        dayCode: self.parseResponsePayload(msg, "payload").dayCode
                    };
                }

                function assembleErrors(msg) {
                    return JSON.parse(msg.value).responseErrors;
                }

                function sendAckMessageSaved(msg) {
                    if (isMyResponse(msg)) {
                        if (isErrors(msg)) {
                            reject(assembleErrors(msg));
                        } else {
                            resolve({ worker: self, msg: assembleAck(msg) });
                        }
                    }
                }

                Bus.subscribe('message-done', sendAckMessageSaved);

                Bus.send('message-new', self.busValue);
            }

            return new Promise(handleNewMessageAsync);
        }
    }]);

    return MessageWorker;
}(Worker);

module.exports = MessageWorker;

//# sourceMappingURL=MessageWorker.js.map