/**
 * Created by py on 06/08/16.
 */

var expect = require('chai').expect;
var MessagePayload = require('../common/MessagePayload');

describe('MessagePayload', function () {
    describe('#constructor(String datCode, Object labels', function () {
        it('It should have "dayCode" and "labels" properties', function () {
            var mp = new MessagePayload('20160723', {isPlan: true, isDeleted: false});
            expect(mp).to.have.property('dayCode');
            expect(mp).to.have.property('labels');
            expect(mp.labels).to.have.property('isPlan');
            expect(mp.labels).to.have.property('isDeleted');
        });

        it('should throw an Error, when "dayCode" does not exists OR wrong length', function () {
            expect(function () {
                new MessagePayload({isPlan: true, isDeleted: false})
            }).to.throw(Error);
            expect(function () {
                new MessagePayload("2016",{isPlan: true, isDeleted: false})
            }).to.throw(Error);
            expect(function () {
                new MessagePayload("201607",{isPlan: true, isDeleted: false})
            }).to.throw(Error);
            expect(function () {
                new MessagePayload("2016074",{isPlan: true, isDeleted: false})
            }).to.throw(Error);
        });

        it('should throw an Error, when "labels" does not exists OR has wrong keys', function () {
            expect(function () {
                new MessagePayload("20160809")
            }).to.throw(Error);
            expect(function () {
                new MessagePayload("20160908",{isPlanned: true, isDeleted: false})
            }).to.throw(Error);
            expect(function () {
                new MessagePayload("20160709",{isPlan: true, isDelete: false})
            }).to.throw(Error);
        });

    });
});