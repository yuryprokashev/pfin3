/**
 * Created by py on 06/09/16.
 */
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Worker = function () {
    function Worker(id, commandId) {
        _classCallCheck(this, Worker);

        this.id = id;
        this.commandId = commandId || undefined;
        this.busValue = {
            requestId: id,
            requestPayload: {},
            requestErrors: []
        };
    }

    _createClass(Worker, [{
        key: "handle",
        value: function handle(request) {}
    }, {
        key: "extract",
        value: function extract(request) {
            function isPOST() {
                return request.body !== undefined && request.method === 'POST';
            }

            function isGET() {
                return request.method === "GET";
            }

            if (isGET()) {
                this.busValue.requestPayload = request.params;
                return this;
            }

            if (isPOST()) {
                this.busValue.requestPayload = request.body;
                return this;
            }
        }
    }, {
        key: "parseMsgValue",
        value: function parseMsgValue(msg) {
            return JSON.parse(msg.value);
        }
    }, {
        key: "parseResponsePayload",
        value: function parseResponsePayload(msg, key) {
            return JSON.parse(JSON.parse(msg.value).responsePayload[key]);
        }
    }, {
        key: "isMyResponse",
        value: function isMyResponse(msg) {
            var responseRequestId = JSON.parse(msg.value).requestId;
            return responseRequestId === self.busValue.requestId;
        }
    }]);

    return Worker;
}();

module.exports = Worker;

//# sourceMappingURL=Worker.js.map