/**
 *Created by py on 14/12/2016
 */

'use strict';
module.exports = (workerFactory, httpCtrl, config) => {

    const appendUserToUpdate = (tgUpdate) => {
        let worker, query, data;

        worker = workerFactory.worker();

        query = {
            "private.telegramId": tgUpdate.message.from.id
        };

        data = undefined;

        return new Promise(
            (resolve, reject) => {
                worker.handle('user-find-one', query, data).then(
                    (result) => {
                        resolve({update: tgUpdate, user: result});
                    },
                    (error) => {
                        reject({update: tgUpdate, user: undefined, error: error});
                    }
                )
            }
        );
    };

    const handleUpdate = (promiseResult) => {
        let worker, query, data;

        worker = workerFactory.worker();

        query = {};

        data = {
            occurredAt: promiseResult.update.message.date,
            sourceId: 2,
            userId: promiseResult.user._id,
            payload: {
                chatId: promiseResult.update.message.chat.id,
                messageId: promiseResult.update.message.message_id,
                text: promiseResult.update.message.text,
                entities: promiseResult.update.message.entities
            }
        };

        worker.handle('create-message', query, data).then(
            (result) => {
                worker.subscribe('create-message-response-processed',
                    (kafkaMessage) => {
                        let message;
                        message = {chat_id: promiseResult.update.message.chat.id, text: `Saved to Payloads: "${result}"`};
                        httpCtrl.sendMessage(message);
                    }
                );
            },
            (error) => {
                let message;
                message = {chat_id: promiseResult.update.message.chat.id, text: `ERROR: Can't save "${promiseResult.update.message.text}"`};
                httpCtrl.sendMessage(message);


            }
        )
    };

    const botCtrl = {};

    botCtrl.handleUpdates = (request, response) => {
        response.status(200).json({});

        let update;
        update = request.body;
        appendUserToUpdate(update).then(
            (result) => {
                // console.log(result);
                handleUpdate(result);
            },
            (error) => {
                console.log(`failed to append users to this update with ${JSON.stringify(error)}`);
            }
        );
    };

    return botCtrl;
};