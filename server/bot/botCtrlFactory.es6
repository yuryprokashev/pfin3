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
    botCtrl.handleUpdates = (request) => {
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
            occuredAt: item.update.date,
            sourceId: 2,
            userId: item.user.msg._id,
            payload: {
                chatId: item.update.chat.id,
                messageId: item.update.message_id,
                text: item.update.text,
                entities: item.update.entities
            }
        };
        worker.handle(query).then(
            (result) => {
                //send 'saved' to telegram chat
                let message;
                message = "saved";
                httpCtrl.sendMessage(message);
            },
            (error) => {
                //send 'error' to telegram chat
                let message;
                message = "error";
                httpCtrl.sendMessage(message);
            }
        );
    };

    return botCtrl;
};