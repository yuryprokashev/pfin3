/**
 *Created by py on 13/12/2016
 */

'use strict';
const Worker2 = require('./Worker2.es6');
class MonthDataWorker2 extends Worker2 {
    constructor(id, commandId, bus) {
        super(id, commandId, bus);
    }
    handle(topic, httpRequest) {
        let query, data;

        query = {
            user: httpRequest.user._id,
            payloadType: httpRequest.params.payloadType,
            sortOrder: httpRequest.params.sortOrder,
            targetPeriod: httpRequest.params.targetPeriod,
        };

        data = undefined;

        super.handle(topic, query, data);
    }
}
module.exports = MonthDataWorker2;