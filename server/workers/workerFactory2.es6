/**
 *Created by py on 08/02/2017
 */
'use strict';

module.exports = (workerId, kafkaService) => {

    let worker = {id: workerId};

    let handleKafkaMessage,
        isMyKafkaMessage;

    // isMyKafkaMessage = (kafkaMessage) => {
    //     let messageSignature;
    //     messageSignature = kafkaService.extractId(kafkaMessage);
    //
    //     return workerId === messageSignature;
    // };


    worker.handle = (topicPrefix, query, data) => {
        return new Promise(
            (resolve, reject) => {
                let context;
                handleKafkaMessage = kafkaMessage => {
                    let response;
                    if(kafkaService.isMyMessage(workerId, kafkaMessage)) {
                        response = kafkaService.extractResponse(kafkaMessage);
                        if(response.error === undefined) {
                            resolve(response);
                        }
                        else {
                            reject(response);
                        }
                    }
                };

                kafkaService.subscribe(`${topicPrefix}-response`, handleKafkaMessage);

                context = kafkaService.createContext(workerId, query, data);
                if(context.error === undefined) {
                    kafkaService.send(`${topicPrefix}-request`, context);
                }
                else {
                    reject(context);
                }


            }
        )
    };

    return worker;

};