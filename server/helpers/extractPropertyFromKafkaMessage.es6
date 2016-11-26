/**
 *Created by py on 22/11/2016
 */
'use strict';
module.exports = (property, kafkaMessage) => {
    let path = property.split('.');
    // console.log(path);
    let result = JSON.parse(kafkaMessage.value);
    let i = 0;
    while(i < path.length) {
        // console.log(path[i]);
        result = result[path[i]];
        // console.log(result);
        i++;
    }
    return result;
};