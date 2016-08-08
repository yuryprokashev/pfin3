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

});