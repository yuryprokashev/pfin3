/**
 *Created by py on 14/12/2016
 */

'use strict';
module.exports = (workerFactory, httpCtrl, config) => {
    let users;
    users = new Map();

    const appendUserToUpdate = (tgUpdate) => {
        let worker, query, data;


        if(users.has(tgUpdate.message.from.id) === true) {
            // console.log('USER EXISTS IN CACHE!');
            return new Promise(
                (resolve, reject) => {
                    resolve({update: tgUpdate, user: users.get(tgUpdate.message.from.id)});
                }
            )
        }
        else {
            worker = workerFactory.worker();

            query = {
                "private.telegramId": tgUpdate.message.from.id
            };

            data = undefined;

            return new Promise(
                (resolve, reject) => {
                    worker.handle('user-find-one', query, data).then(
                        (result) => {
                            users.set(tgUpdate.message.from.id, result);
                            resolve({update: tgUpdate, user: result});
                            workerFactory.purge(worker.id);
                        },
                        (error) => {
                            reject({update: tgUpdate, user: undefined, error: error});
                            workerFactory.purge(worker.id);
                        }
                    )
                }
            );
        }
    };

    const handleUpdate = (promiseResult) => {
        let worker, query, data;

        worker = workerFactory.worker();
        // workerFactory.log();

        query = {};

        data = {
            occurredAt: promiseResult.update.message.date * 1000, // tg sends seconds, not milliseconds
            sourceId: 2, // 1 - browser, 2 - tg bot
            userId: promiseResult.user._id,
            payload: {
                type: 0, // meaning other than expense (unsorted)
                amount: undefined,
                dayCode: transformTgDateToCode('day', promiseResult.update.message.date),
                monthCode: transformTgDateToCode('month', promiseResult.update.message.date),
                description: promiseResult.update.message.text,
                labels: {
                    isDeleted:false,
                    isPlan: false
                }

            }
        };

        worker.handle('create-message', query, data).then(
            (result) => {
                worker.subscribe('create-message-response-processed', (kafkaMessage) => {
                    workerFactory.purge(worker.id);
                    console.log(JSON.stringify(kafkaMessage));
                    let message;
                    let v = JSON.parse(kafkaMessage.value).response;
                    message = {chat_id: promiseResult.update.message.chat.id, text: `Status: ${JSON.stringify(v.description)}`};
                    httpCtrl.sendMessage(message);

                });

            },
            (error) => {
                let message;
                message = {chat_id: promiseResult.update.message.chat.id, text: `ERROR: Can't save "${promiseResult.update.message.text}"`};
                httpCtrl.sendMessage(message);
                workerFactory.purge(worker.id);
                // workerFactory.log();
            }
        );

    };

    const transformTgDateToCode = (codeType, tgDate) => {
        let d, year, month, day;

        d = new Date(tgDate*1000);
        year = d.getFullYear();
        month = d.getMonth() + 1;
        day = d.getDate();

        switch (codeType){
            case 'day':
                return `${year}${month}${day}`;
                break;
            case 'month':
                return `${year}${month}`;
                break;
            default:
                return null;
        }
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