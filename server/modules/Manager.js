/**
 * Created by py on 19/09/16.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkerFactory = require('./WorkerFactory');
var MessagePayload = require('../../client/js/MessagePayload');
var ExpenseMessagePayload = require('../../client/js/ExpenseMessagePayload');
var Message = require('../../client/js/Message');
var guid = require('../../client/js/guid');
var MyDates = require('../../client/js/MyDates');

var Manager = function () {
    function Manager() {
        _classCallCheck(this, Manager);

        this.factory = new WorkerFactory();
        this.currentWorkers = new Map();
    }

    _createClass(Manager, [{
        key: 'manage',
        value: function manage(request, response) {
            // var _this = this;
            // function transformToRequest(worker, payload){
            //
            //     function findTargetMonthCode(monthCode, delta){
            //         let year = monthCode.substring(0,4);
            //         let month = monthCode.substring(4,6) || undefined;
            //         let day = monthCode.substring(6,8) || undefined;
            //         if(month !== undefined){
            //             let monthNum = Number(month) + delta;
            //             let newMonth = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
            //             return `${year}${newMonth}${day}`;
            //         }
            //         else {
            //             throw new Error('monthCode does not contain month (6 chars expected)');
            //         }
            //     }
            //     let requestLikePayload = {
            //         method: "POST",
            //         body: {}
            //     };
            //      let p = new MessagePayload(
            //          findTargetMonthCode(payload.dayCode, 1),
            //          {
            //              isPlan: true,
            //              isDeleted: payload.labels.isDeleted
            //          }
            //      );
            //     let emp = new ExpenseMessagePayload(
            //         p,
            //         payload.amount,
            //         `copy of ${payload.description}`,
            //         undefined
            //     );
            //     requestLikePayload.body = new Message(
            //         payload.userId,
            //         payload.sourceId,
            //         payload.type,
            //         emp,
            //         undefined,
            //         payload.commandId
            //     );
            //     return requestLikePayload;
            // } // not needed
            // function oneMessagePromiseFromPayload(message){
            //     console.log(message);
            //     let w = _this.factory.worker('message', message.commandId);
            //     let transformedPayload = transformToRequest(w, message);
            //     return w.handle(transformedPayload, response);
            // } // not needed
            // function payloadsReceivedCallback(payloads){
            //     // console.log(payloads.msg);
            //     let messages = payloads.msg.map(function(item){
            //         item.commandId = payloads.worker.commandId;
            //         return item;
            //     });
            //     let messagePromises = messages.map(
            //         oneMessagePromiseFromPayload
            //     );
            //     // _this.purge(payloads.worker.id);
            //     console.log('Message promises');
            //     console.log(messagePromises);
            //     return Promise.all(messagePromises);
            // } // not needed
            // function setWorker(workerType, query){
            //     let task = this.factory.worker(workerType, query.commandId);
            //     this.currentWorkers.set(task.id, task);
            //     return task.handle(query, response);
            // }
            if (this.isPayload(request)) {
                var getQuery = this.makeGetQueryFromRequest(request);
                var task1 = this.factory.worker('payload', undefined);
                this.currentWorkers.set(task1.id, task1);
                return task1.handle(getQuery, response);
            } else if (this.isMessage(request)) {
                var _task = this.factory.worker('message', undefined);
                this.currentWorkers.set(_task.id, _task);
                return _task.handle(request, response);
            } else if (this.isCommandCopy(request)) {
                var query = this.makeCopyQuery(request);
                var task = this.factory.worker('copyPayload', request.params.commandId);
                this.currentWorkers.set(task.id, task);
                return task.handle(query, response);
            } else if (this.isCommandClear(request)) {
                var _query = this.makeClearQuery(request);
                var _task2 = this.factory.worker('clearPayload', request.params.commandId);
                this.currentWorkers.set(_task2.id, _task2);
                return _task2.handle(_query, response);
            } else if (this.isGetMonthData(request)) {
                var _query2 = this.makeMonthDataQuery(request);
                var _task3 = this.factory.worker('monthData', undefined);
                this.currentWorkers.set(_task3.id, _task3);
                return _task3.handle(_query2, response);
            }
        }
    }, {
        key: 'makeMonthDataQuery',
        value: function makeMonthDataQuery(request) {
            var q = {
                user: request.user._id.toString(),
                payloadType: Number(request.params.payloadType),
                sortOrder: {},
                targetPeriod: request.params.targetPeriod
            };
            return q;
        }
    }, {
        key: 'makeGetQueryFromRequest',
        value: function makeGetQueryFromRequest(request) {
            var getQuery = {
                user: request.user._id.toString(),
                payloadType: Number(request.params.payloadType),
                sortOrder: {}
            };

            if (this.isGetPayloadDay(request)) {
                getQuery.dayCode = request.params.dayCode;
                getQuery.sortOrder[request.params.sortParam] = Number(request.params.sortOrder);
            }

            if (this.isGetPayloadMonth(request)) {
                getQuery.monthCode = request.params.dayCode;
            }

            return getQuery;
        }
    }, {
        key: 'makeCopyQuery',
        value: function makeCopyQuery(request) {
            var q = {
                user: request.user._id.toString(),
                payloadType: Number(request.params.payloadType),
                sortOrder: {},
                targetPeriod: request.params.targetPeriod,
                sourcePeriod: request.params.sourcePeriod,
                commandType: request.params.commandType,
                occuredAt: MyDates.now()
            };
            return q;
        }
    }, {
        key: 'makeClearQuery',
        value: function makeClearQuery(request) {
            var q = {
                user: request.user._id.toString(),
                payloadType: Number(request.params.payloadType),
                sortOrder: {},
                targetPeriod: request.params.targetPeriod,
                commandType: request.params.commandType,
                occuredAt: MyDates.now()
            };
            return q;
        }
    }, {
        key: 'isGetPayloadDay',
        value: function isGetPayloadDay(request) {
            return request.params.dayCode.length === 8;
        }
    }, {
        key: 'isGetPayloadMonth',
        value: function isGetPayloadMonth(request) {
            return request.params.dayCode.length === 6;
        }
    }, {
        key: 'isGetMonthData',
        value: function isGetMonthData(request) {
            var monthData = /monthData/;
            var payload = /payload/;
            return payload.test(request.url) && monthData.test(request.url);
        }
    }, {
        key: 'isPayload',
        value: function isPayload(request) {
            var payload = new RegExp("payload");
            var monthData = /monthData/;
            return payload.test(request.url) && !monthData.test(request.url);
        }
    }, {
        key: 'isMessage',
        value: function isMessage(request) {
            var message = new RegExp("message");
            return message.test(request.url);
        }
    }, {
        key: 'isCommandCopy',
        value: function isCommandCopy(request) {
            var command = new RegExp("command");
            var type = /copy/;
            return command.test(request.url) && type.test(request.url);
        }
    }, {
        key: 'isCommandClear',
        value: function isCommandClear(request) {
            var command = new RegExp("command");
            var type = /clear/;
            return command.test(request.url) && type.test(request.url);
        }
    }, {
        key: 'returnResult',
        value: function returnResult(result) {
            result.worker.response.json(result.msg);
            purge(result.worker.id);
        }
    }, {
        key: 'returnResultA',
        value: function returnResultA(resultArray) {
            var res = resultArray[0].worker.response;
            var monthCode = resultArray[0].msg.dayCode.substring(0, 6);
            res.json({
                commandId: resultArray[0].worker.commandId,
                monthCode: monthCode
            });
        }
    }, {
        key: 'returnCommandResult',
        value: function returnCommandResult(result) {
            result.worker.response.json(result.msg);
            this.purge(result.worker.id);
        }
    }, {
        key: 'returnError',
        value: function returnError(error) {
            console.log(error);
            error.response.json({ error: error });
            purge(error.worker.id);
        }
    }, {
        key: 'purge',
        value: function purge(id) {
            this.currentWorkers.delete(id);
        }
    }]);

    return Manager;
}();

module.exports = Manager;

//# sourceMappingURL=Manager.js.map