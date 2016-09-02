/**
 * Created by py on 27/08/16.
 */

// End-2-End Test Suite
// I will define tests for user scenarios here.
var expect = require('chai').expect;

// SCENARIO 1 -> User updates item in UI, click 'Save' and sees changes are being applied
// - What happens:
// -- User updates the Expense item in certain Day via UI and clicks 'Save'.
// Say, User changed both 'item.amount' and 'item.description'.
// -- Client.AppView sets 'item.isAwaitingAsyncPush' for item, that has been updated, to TRUE.
describe('SCENARIO 1 -> User updates item in UI, click "Save" and sees changes are being applied.', function () {

});


// SCENARIO 2 -> User sees changes has been applied successfully.
// - What happens:
// -- Client.AppView sends a Message via MessagePoster - HTTP POST to /api/v1/message/:timeWindow.
// -- Pfin.api receives a Message and saves in to Message Model.
// -- Pfin.api sends 'message-new' thru Bus (based on Kafka Adapter)
// -- PayloadService gets the 'message-new', extracts payload and save it Payload Model.
// -- PaylodaService sends 'payload-new' thru Bus (based on KafkaAdapter)
// -- Pfin.PusherServer (based on socket.io) gets the 'payload-new' and send push to Client.AppView.PusherClient.
// -- Client.AppView.PusherClient listens to 'payload-new' and invokes change of 'Shared' variable, which causes Client.AppView.update to run.
// -- Client.AppView.update changes the 'item.isAwaitingAsyncPush' to FALSE.

// SCENARIO 3 -> User sees changes has been failed to POST.
// - What happens:
// -- Client.AppView sends a Message via MessagePoster - HTTP POST to /api/v1/message/:timeWindow.
// -- Pfin.api replied with Error.
// -- Client.AppView renders the Error to User
// -- Client.AppView allows to resend the Message.
// -- User clicks 'Save' -> goto SCENARIO 1.