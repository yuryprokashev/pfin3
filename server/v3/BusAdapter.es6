/**
 *Created by py on 10/11/2016
 */

'use strict';

const EventEmitter = require('events').EventEmitter;
const Handler = require('./Handler.es6');

class KafkaAdapter extends EventEmitter {
    constructor(){
        this.handlers = new Map();
    }
    listen(){
        this.on('bus-request', function(request){
            let handler = new Handler(request);
            let result = handler.handle();
            this.send(result);
        });

    }
    send(response){
        this.emit('bus-response', response);
    }
}

module.exports = KafkaAdapter;