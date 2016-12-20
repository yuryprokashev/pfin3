/**
 *Created by py on 14/12/2016
 */

'use strict';
const Worker2 = require('./Worker.es6');
class BotMessageWorker2 extends Worker2 {
    constructor(id, commandId, bus) {
        super(id, commandId, bus);
    }
    handle(topic, httpRequest) {
        let query, data;

        query = {
            user: httpRequest.user._id.toString(),
            payloadType: Number(httpRequest.params.payloadType),
            sortOrder: httpRequest.params.sortOrder,
            targetPeriod: httpRequest.params.targetPeriod,
        };

        data = {
            occurredAt: item.update.message.date,
            sourceId: 2,
            user: item.user.msg._id,
            payload: {
                chatId: item.update.message.chat.id,
                messageId: item.update.message.message_id,
                text: item.update.message.text,
                entities: item.update.message.entities
            }
        };

        return super.handle(topic, query, data);
    }
}
module.exports = BotMessageWorker2;