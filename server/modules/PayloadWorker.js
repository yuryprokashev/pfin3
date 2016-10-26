/**
 * Created by py on 06/09/16.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Worker = require('./Worker');

var Bus = require('../services/BusService');

var guid = require('../../client/js/guid');

var PayloadWorker = function (_Worker) {
    _inherits(PayloadWorker, _Worker);

    function PayloadWorker(id, commandId) {
        _classCallCheck(this, PayloadWorker);

        return _possibleConstructorReturn(this, (PayloadWorker.__proto__ || Object.getPrototypeOf(PayloadWorker)).call(this, id, commandId));
    }

    _createClass(PayloadWorker, [{
        key: 'handle',
        value: function handle(getQuery, response) {
            getQuery.requestId = this.id;
            this.response = response;
            var _this = this;

            return new Promise(function (resolve, reject) {

                Bus.subscribe('payload-response', function (msg) {
                    var responseRequestId = JSON.parse(msg.value).requestId;
                    if (responseRequestId === _this.id) {
                        resolve({ worker: _this, msg: getPayloadFromKafkaMessage(msg) });
                    }
                });

                Bus.send('payload-request', getQuery);
            });
        }
    }]);

    return PayloadWorker;
}(Worker);

// @param: KafkaMessage msg
// @function: parse Kafka message and return JSON representation of it's payload
// @return: Object in JSON format.


var getPayloadFromKafkaMessage = function getPayloadFromKafkaMessage(msg) {
    return JSON.parse(msg.value).payload;
};

module.exports = PayloadWorker;

//# sourceMappingURL=PayloadWorker.js.map