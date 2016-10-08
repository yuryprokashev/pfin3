/**
 * Created by py on 11/08/16.
 */

var chai = require("chai");
var expect = require('chai').expect;

var Bus = require('./BusService');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);


describe('Bus Service', function () {
    describe('#send(String topic, Object message', function () {
        it('should report the message is sent to Bus', function () {

        });
    });
    describe('#subscribe(String topic, Function callback', function () {
        it('should get message from particular topic', function () {

            Bus.subscribe('message-new', function (message) {
                expect(message.topic).to.be.equal('message-new');
                console.log(message);
                done();
            });
            var result = JSON.stringify({some: "this", thing: "is not a case"});
            Bus.send('message-new', {message: result});
        });
    })
});