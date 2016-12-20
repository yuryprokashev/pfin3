/**
 *Created by py on 14/12/2016
 */

'use strict';
module.exports = (workerFactory, httpCtrl, config) => {
    let handleUpdate, appendUserToUpdate;

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