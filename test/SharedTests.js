/**
 * Created by py on 30/06/16.
 */

var expect = require('chai').expect;
var Shared = require('../common/Shared');
describe('Shared', function () {

    describe('#constructor', function(){
        // todo. write tests for constructor
    });

    describe('#functions.setValues(res, obj)', function(){
        var shared1 = Shared.getInstance();
        it('should set the values, that are passed in res.data', function(){
            var responseMock = {data:{x:[1,2], y:[4,3]}};
            var obj = {x:[], y:[]};
            expect(shared1.fns.setValues(responseMock, obj)).to.be.eql({x:[1,2], y:[4,3]});
        });

        it('should set the values, that are passed in res if !res.data is provided', function(){
            var responseMock = {x:[1,2], y:[4,3]};
            var obj = {x:[], y:[]};
            expect(shared1.fns.setValues(responseMock, obj)).to.be.eql({x:[1,2], y:[4,3]});
        });

        it('should NOT reset values for keys in obj, that are NOT passed in res.data', function(){
            var responseMock = {data:{x:[1,2], y:[4,3]}};
            var obj = {x:[0,0], y:[1,1], z: [0,0]};
            expect(shared1.fns.setValues(responseMock, obj)).to.be.eql({x:[1,2], y:[4,3], z:[0,0]});
        });

        it('should throw Error, if res.data has key, that does not exists in obj', function(){

            var responseMock = {data:{x:[1,2], z:[4,3]}};
            var obj = {x:[], y:[]};
            expect(function(){
                shared1.fns.setValues(responseMock, obj);
            }).to.throw(Error);
        });
    });

    describe('#push(String arrayKey, Object valueToAdd)', function () {
        it('should add the valueToAdd to Shared.state[arrayKey]', function () {
            Shared.push('updatedDays', "20160709");
            expect(Shared.getInstance().state.updatedDays[0]).to.be.equal("20160709");
            Shared.clear('updatedDays');
        });

        it('should ignore valueToAdd, if it is already in Shared.state[arrayKey]', function () {
            Shared.push('updatedDays', "20160709");
            Shared.push('updatedDays', "20160709");
            expect(Shared.getInstance().state.updatedDays.length).to.be.equal(1);
            Shared.clear('updatedDays');
        });

    });

    describe('#check(String arrayKey, Object valueToCheck)', function () {
        it('should return true if valueToCheck is in Shared.state[arrayKey]', function () {
            Shared.push('updatedDays', "20160720");
            expect(Shared.check("updatedDays", "20160720")).to.be.equal(true);
            Shared.clear('updatedDays');
        });
        it('should return false if valueToCheck is NOT in Shared.state[arrayKey]', function () {
            Shared.push('updatedDays', "20160730");
            expect(Shared.check("updatedDays", "20160710")).to.be.equal(false);
            Shared.clear('updatedDays');
        });
        it('should return true if valueToCheck = "201607" and state.updatesKeys has "201607xx" string', function () {
            Shared.push('updatedDays', "20160730");
            expect(Shared.check("updatedDays", "201607")).to.be.equal(true);
            Shared.clear('updatedDays');
        });
        it('should return false if valueToCheck = "201607" and state.updatesKeys has "201608xx" string', function () {
            Shared.push('updatedDays', "20160830");
            expect(Shared.check("updatedDays", "201607")).to.be.equal(false);
            Shared.clear('updatedDays');
        });
    });

    describe('#remove(String arrayKey, Object valueToRemove)', function () {
        it('should remove the valueToRemove from Shared.state[arrayKey]', function () {
            Shared.push('updatedDays', "20160709");
            Shared.push('updatedDays', "20160710");
            Shared.push('updatedDays', "20160711");
            Shared.remove('updatedDays', "20160710");
            expect(Shared.getInstance().state.updatedDays.length).to.be.equal(2);
            expect(Shared.getInstance().state.updatedDays).to.be.eql(["20160709", "20160711"]);
            Shared.clear('updatedDays');
        })
    });
});