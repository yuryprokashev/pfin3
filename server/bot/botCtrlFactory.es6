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
        let updates;
        updates = [request.body];
        updatesWithUsers = updates.map(appendUserToUpdate);
        console.log(updatesWithUsers);
        Promise.all(updatesWithUsers).then(
            (items) => {
                items.forEach(handleUpdate);
            },
            (error) => {
                console.log(`failed to append users to this update`);
            }
        );

    };

    appendUserToUpdate = (tgUpdate) => {
        let userQuery;
        let worker;
        worker = workerFactory.worker('findUser');
        userQuery = {
            query: {
                "private.telegramId": tgUpdate.message.from
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
    };

    handleUpdate = (item) => {
        let query;
        let worker;
        worker = workerFactory.worker('botMessage');
        query = {
            occuredAt: item.update.date,
            sourceId: 2,
            userId: item.user._id,
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