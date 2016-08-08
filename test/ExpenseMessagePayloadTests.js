/**
 * Created by py on 06/08/16.
 */

var expect = require('chai').expect;
var MessagePayload = require('../common/MessagePayload');
var ExpenseMessagePayload = require('../common/ExpenseMessagePayload');

describe('ExpenseMessagePayload (Decorated MessagePayload)', function () {

    describe('#constructor(MessagePayload p, int amount, String desc)', function () {

        it('It should have "dayCode" and "labels" properties, to ensure interface stays the same', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            var emp = new ExpenseMessagePayload(mp, 1000, "test");
            expect(emp).to.have.property('dayCode');
            expect(emp).to.have.property('labels');
            expect(emp.labels).to.have.property('isPlan');
            expect(emp.labels).to.have.property('isDeleted');
        });

        it('It should have "amount" and "description" properties', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            var emp = new ExpenseMessagePayload(mp, 1000, "test");
            expect(emp).to.have.property('amount');
            expect(emp).to.have.property('description');
        });

        it('should throw an Error, when "amount" does not exists OR less than 0, or even not Number', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            expect(function () {
                new ExpenseMessagePayload(mp)
            }).to.throw(Error);
            expect(function () {
                new ExpenseMessagePayload(mp, "desc")
            }).to.throw(Error);
            expect(function () {
                new ExpenseMessagePayload(mp, -1000)
            }).to.throw(Error);
        });

        it('should throw an Error, when "description" does not exists OR it is not String', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            expect(function () {
                new ExpenseMessagePayload(mp, 1000, 1000)
            }).to.throw(Error);
            expect(function () {
                new ExpenseMessagePayload(mp, 1000)
            }).to.throw(Error);
        });
    });
});