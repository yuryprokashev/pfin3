/**
 * Created by py on 05/08/16.
 */

var Message;

var MyDates = require('./MyDates.es6');

// param: String user - id of the user, who posts the Message
// param: int sourceId - code for Message sources. 1 - for WebBrowser
// param: int type - code toe Message Type. 1 - for 'Expense'
// param: ExpenseMessagePayload emp - payload object
// function: constructs Message object
// return: Message object
Message = function(user, sourceId, type, emp, userToken, commandId) {
    if(user === undefined || typeof user !== 'string') {
        throw new Error('user is either undefined or not String');
    }
    else {
        this.user = user;
    }

    if(sourceId === undefined || typeof sourceId !== 'number') {
        throw new Error('message source id is either undefined, or not integer');
    }
    else {
        this.sourceId = sourceId;

    }

    if(type === undefined || typeof type !== 'number') {
        throw new Error('message type is either undefined or not integer');
    }
    else {
        this.type = type;
    }

    if(emp === undefined){
        throw new Error('payload is either undefined (ExpenseMessagePayload expected)');
    }
    else {
        this.payload = emp;
    }

    this.userToken = userToken;

    this.commandId = commandId;

    this.occurredAt = MyDates.now();
};


module.exports = Message;