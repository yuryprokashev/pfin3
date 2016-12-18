/**
 *Created by py on 29/11/2016
 */
'use strict';
module.exports = (workerFactory, httpCtrl, config) => {
    let handleUpdate;
    let appendUserToUpdate;
    const botCtrl = {};
    let updatesWithUsers = [];
    //@param: telegram updates array
    //@function: create one kafka message to 'bot-updates-request'
    // for each update and create listeners for 'bot-updates-response'
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

    appendUserToUpdate = (tgUpdate) => {
        let userQuery;
        let worker;
        worker = workerFactory.worker('findUser');
        userQuery = {
            query: {
                "private.telegramId": tgUpdate.message.from.id
            }
        };
        return new Promise(
            (resolve, reject) => {
                worker.handle(userQuery).then(
                    (result) => {
                        resolve({update: tgUpdate, user: result});
                    },
                    (error) => {
                        reject({update: tgUpdate, user: error});
                    });
            });
    };

    handleUpdate = (item) => {
        let query;
        let worker;
        worker = workerFactory.worker('botMessage');
        query = {
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
        console.log(query);
        worker.handle(query).then(
            (result) => {
                //send 'saved' to telegram chat
                let message;
                message = {chat_id: item.update.message.chat.id, text: `Saved: "${item.update.message.text}"`};
                httpCtrl.sendMessage(message);
            },
            (error) => {
                //send 'error' to telegram chat
                let message;
                message = {chat_id: item.update.message.chat.id, text: "error"};
                httpCtrl.sendMessage(message);
            }
        );
    };

    return botCtrl;
};