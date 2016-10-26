/**
 * Created by py on 19/09/16.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Worker = require('./Worker');
var Bus = require('../services/BusService');
var WorkerFactory = require('./WorkerFactory');

var workerFactory = new WorkerFactory();

var CommandWorker = function (_Worker) {
    _inherits(CommandWorker, _Worker);

    function CommandWorker(id) {
        _classCallCheck(this, CommandWorker);

        return _possibleConstructorReturn(this, (CommandWorker.__proto__ || Object.getPrototypeOf(CommandWorker)).call(this, id));
    }

    _createClass(CommandWorker, [{
        key: 'handle',
        value: function handle(request, response) {

            function handleCopyCommandAsync(resolve, reject) {
                // get the payloads via 'payload-request'
                var payloadWorker = workerFactory.worker('payload');
                // var payloads = [];
                payloadWorker.handle(request, response).then(function (result) {
                    // payloads.push(result);
                    resolve(result);
                }, function (error) {
                    reject({ error: error });
                });
            }

            return new Promise(handleCopyCommandAsync);
            // var messageWorker = workerFactory.worker('message');

            // wait while everything arrives
            // for every payload execute transform
            // pack every payload to message
            // send via Bus 'message-new'
            // respond with {commandType: "copy", code: monthCode}

            // Pusher service
            // wait while all payloads arrive
            // reply with push, saying that this daycode or monthcode is ready.
        }
    }]);

    return CommandWorker;
}(Worker);

module.exports = CommandWorker;

//# sourceMappingURL=CommandWorker.js.map