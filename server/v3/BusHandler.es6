/**
 *Created by py on 10/11/2016
 */

'use strict';

const EventEmitter = require('events').EventEmitter;

class Handler extends EventEmitter {
    constructor(request){
        this.request = request;
    }
    handle(){
        console.log(this.request);
    }
}

module.exports = Handler;