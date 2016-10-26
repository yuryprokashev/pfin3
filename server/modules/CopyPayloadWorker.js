/**
 * Created by py on 27/09/16.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Worker = require('./Worker');
var Bus = require('../services/BusService');

var CopyPayloadWorker = function (_Worker) {
    _inherits(CopyPayloadWorker, _Worker);

    function CopyPayloadWorker(id, commandId) {
        _classCallCheck(this, CopyPayloadWorker);

        return _possibleConstructorReturn(this, (CopyPayloadWorker.__proto__ || Object.getPrototypeOf(CopyPayloadWorker)).call(this, id, commandId));
    }

    _createClass(CopyPayloadWorker, [{
        key: 'handle',
        value: function handle(query, response) {
            query.requestId = this.id;
            query.commandId = this.commandId;
            this.response = response;
            var _this = this;

            function sendCopyCommandAsync(resolve, reject) {

                function isMyResponse(msg) {
                    var responseRequestId = JSON.parse(msg.value).requestId;
                    return responseRequestId === _this.busValue.requestId;
                }

                function isErrors(msg) {
                    return JSON.parse(msg.value).responseErrors.length !== 0;
                }

                function assembleErrors(msg) {
                    return JSON.parse(msg.value).responseErrors;
                }

                function assembleAck(msg) {
                    return {
                        target: JSON.parse(msg.value).responsePayload[0].monthCode
                    };
                }

                function sendCopySuccess(msg) {
                    console.log(msg);
                    if (isMyResponse(msg)) {
                        if (isErrors(msg)) {
                            reject(assembleErrors(msg));
                        } else {
                            resolve({ worker: _this, msg: assembleAck(msg) });
                        }
                    }
                }

                Bus.subscribe('copy-payload-response', sendCopySuccess);
                Bus.send('copy-payload-request', query);
            }
            return new Promise(sendCopyCommandAsync);
        }
    }]);

    return CopyPayloadWorker;
}(Worker);

module.exports = CopyPayloadWorker;

//# sourceMappingURL=CopyPayloadWorker.js.map