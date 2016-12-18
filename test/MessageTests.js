/**
 * Created by py on 06/08/16.
 */

var expect = require('chai').expect;
var MessagePayload = require('../common/MessagePayload');
var ExpenseMessagePayload = require('../common/ExpenseMessagePayload');
var Message = require('../common/Message');

describe('Message', function () {

    describe('#constructor(String user, int sourceId, int type, ExpenseMessagePayload emp)', function () {

        it('It should have "user", "sourceId", "type", "payload" and "occuredAt" properties', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            var emp = new ExpenseMessagePayload(mp, 1000, "test");
            var m = new Message("wwehjwerkjqw02134", 1, 1, emp);

            expect(m).to.have.property('user');
            expect(m).to.have.property('sourceId');
            expect(m).to.have.property('type');
            expect(m).to.have.property('payload');
            expect(m).to.have.property('occuredAt');
        });

        it('should have "occuredAt" property type = Number ', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            var emp = new ExpenseMessagePayload(mp, 1000, "test");
            var m = new Message("wwehjwerkjqw02134", 1, 1, emp);

            expect(m.occurredAt).to.be.a('number');
        });

        it('should throw an Error, when "user" does not exists OR not String', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            var emp = new ExpenseMessagePayload(mp, 1000, "test");

            expect(function () {
                new Message()
            }).to.throw(Error);
            expect(function () {
                new Message(1000, 1,1, emp)
            }).to.throw(Error);
        });

        it('should throw an Error, when "sourceId" does not exists OR it is not Number', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            var emp = new ExpenseMessagePayload(mp, 1000, "test");

            expect(function () {
                new Message("wrwelnfs", "jkfsd", 1, emp)
            }).to.throw(Error);
            expect(function () {
                new Message("wrwelnfs")
            }).to.throw(Error);
        });

        it('should throw an Error, when "type" does not exists OR it is not Number', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            var emp = new ExpenseMessagePayload(mp, 1000, "test");

            expect(function () {
                new Message("wrwelnfs", 1, "jkfsd", emp)
            }).to.throw(Error);
            expect(function () {
                new Message("wrwelnfs",1)
            }).to.throw(Error);
        });

        it('should throw an Error, when "payload" does not exists', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            var emp = new ExpenseMessagePayload(mp, 1000, "test");

            expect(function () {
                new Message("wrwelnfs", 1, 1)
            }).to.throw(Error);
        });
    });
});