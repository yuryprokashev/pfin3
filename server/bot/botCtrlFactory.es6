/**
 *Created by py on 29/11/2016
 */
'use strict';
module.exports = (workerFactory, httpCtrl, config) => {
    const botCtrl = {};
    let updatesWithUsers = [];
    //@param: telegram updates array
    //@function: create one kafka message to 'bot-updates-request'
    // for each update and create listeners for 'bot-updates-response'
    botCtrl.handleUpdates = (updates) => {
        console.log(updates);
        updatesWithUsers = updates.map(appendUserToUpdate);
        Promise.all(updatesWithUsers).then(
            (items) => {
                items.forEach(handleUpdate);
            },
            (error) => {
                console.log(`failed to append users to this update`);
            }
        );

    };

    let appendUserToUpdate = (tgUpdate) => {
        let worker = workerFactory.worker('findUser');
        let userQuery = {query: {telegramId: tgUpdate.from}};
        return {update: tgUpdate, user: worker.handle(userQuery)};
    };

    let handleUpdate = (item) => {
        let worker = workerFactory.worker('botMessage');
        let query = {
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
                let message = "saved";
                httpCtrl.sendMessage(message);
            },
            (error) => {
                //send 'error' to telegram chat
                let message = "error";
                httpCtrl.sendMessage(message);
            }
        );
    };

    return botCtrl;
};