/**
 * Created by py on 09/08/16.
 */

// responsible: store Messages in 'messages' collection
// responsible: reply to Client the {success: true} or {success:false, errors:[]}
// responsible: put 'message-new' to Bus

var MessageService;
var KafkaAdapter = require('./KafkaAdapter');
var BusConstructor = require('./BusService');
var Bus = new BusConstructor(new KafkaAdapter());
var MyDates = require('../../common/MyDates');
var wagner = require('wagner-core');
var MessageModel = wagner.invoke(function(Message){ return Message });
var guid = require("../../common/guid");



// param: MessageModel m - model of Message in DB. Should be provided, so MessageService can write Messages to 'messages' collection
// function: module constructor. IIFE (= invoked immediately after 'require' call)
// return: MessageService api

MessageService = function(m) {

    // param: HttpRequest r
    // param: Function callback
    // function: store the Message in 'messages' collection.
    // return: Object reply - object to be send back to Client
    var handleNewClientMessage = function(r, callback){
        var reply;
        var message = r.body;
        var _id = guid();
        m.create(
            {
                _id: _id,
                occuredAt: message.occuredAt,
                storedAt: MyDates.now(),
                sourceId: message.sourceId,
                userId: message.user,
                payload: JSON.stringify(message.payload),
                userToken: message.userToken
            },
            function( err, result ){
                if(err){
                    callback({success: false, error: err});
                }
                else if(result){
                    callback({success: true, _id: _id});
                    Bus.send('message-new', {message: result});
                }
            }
            );
    };

    return {
        handle: handleNewClientMessage
    }

}(MessageModel);

module.exports = MessageService;