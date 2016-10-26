/**
 * Created by py on 06/09/16.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PayloadWorker = require('./PayloadWorker');
var MessageWorker = require('./MessageWorker');
var CopyPayloadWorker = require('./CopyPayloadWorker');
var ClearPayloadWorker = require('./ClearPayloadWorker');
var MonthDataWorker = require('./MonthDataWorker');
var guid = require('../../client/js/guid');

var WorkerFactory = function () {
    function WorkerFactory() {
        _classCallCheck(this, WorkerFactory);

        this.availableWorkerTypes = {
            payload: PayloadWorker,
            message: MessageWorker,
            copyPayload: CopyPayloadWorker,
            clearPayload: ClearPayloadWorker,
            monthData: MonthDataWorker
        };

        this.currentWorkers = {};
    }

    _createClass(WorkerFactory, [{
        key: 'worker',
        value: function worker(type, commandId) {
            var id = guid();
            var newWorker = new this.availableWorkerTypes[type](id, commandId);
            this.currentWorkers[id] = newWorker;
            return newWorker;
        }
    }]);

    return WorkerFactory;
}();

module.exports = WorkerFactory;

//# sourceMappingURL=WorkerFactory.js.map