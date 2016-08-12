/**
 * Created by py on 09/08/16.
 */
var mongoose = require( 'mongoose' );
var User = require( './user.schema' );
var MyDates = require('../../common/MyDates');

var messageSchema = new mongoose.Schema( {

    _id: { type: String, required: true }, // -> guid(), added on server when saved to Messages collection

    occuredAt: { type: Number, required: true }, // -> milliseconds from 1-Jan-1970, received from client

    storedAt: {type: Number, required: true}, // -> milliseconds from 1-Jan-1970, added on server when saved to Messages collection

    sourceId: {type: Number, required: true}, // -> indicator of the Message source system, received from client

    // type: {type: Number, required: false}, // -> indicator of message type (e.g. expense), received from client, or evaluated on server

    userId: {type: String, ref: 'User'}, // -> indicator of a User, generated the Message, received from client

    payload: {type: String, required: true} // -> Message will carry Payload as a simple string, it will store Payload also as String.
});

messageSchema.set( 'toObject', { virtuals: true });
messageSchema.set( 'toJSON', { virtuals: true });

module.exports = messageSchema;