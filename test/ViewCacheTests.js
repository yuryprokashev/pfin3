var expect = require('chai').expect;
var ViewCache = require('../common/ViewCache');
var MyDates = require('../common/MyDates');

var TimeWindow = require( '../common/TimeWindow' );

var timeWindowL0 = MyDates.twToString(new TimeWindow(),'');
var timeWindowL1 = MyDates.twToString(new TimeWindow().set({year: 2016}),'');
var timeWindowL2 = MyDates.twToString(new TimeWindow().set({year: 2015, month: 4}),'');
var timeWindowL3 = MyDates.twToString(new TimeWindow().set({year: 2017, month: 2, day: 28}),'');

var randomArray = function(length) {
    var array = [];

    for(var i = 0; i< length; i++) {
        array.push(Math.floor(Math.random() * 100));
    }
    return array;
};

var generateTimeWindows = function(level, length) {
    var result = [];
    var year, month, day;
    for(var i = 0; i < length; i++){
        if(level === 1) {
            do {
                year = Math.floor(Math.random() * 2050);
            } while (year.toString().length !== 4);

            month = null;
            day = null;
        }
        else if(level === 2) {
            do {
                year = Math.floor(Math.random() * 2050);
            } while (year.toString().length !== 4);
            month = Math.floor(Math.random() * 12) + 1;
            day = null;
        }
        else if(level === 3) {
            do {
                year = Math.floor(Math.random() * 2050);
            } while (year.toString().length !== 4);
            month = Math.floor(Math.random() * 12) + 1;
            day = Math.floor(Math.random() * 27) + 1;
        }
        result.push(new TimeWindow({year: year, month: month, day: day}));
    }
    return result;
};

var fillViewCache = function(viewCache, timeWindowArray) {
    for(var i = 0 ; i < timeWindowArray.length; i++) {
        var t = MyDates.twToString(timeWindowArray[i],'');
        viewCache.put(t, randomArray(Math.floor(Math.random() * 5) + 1));
        // console.log(viewCache.state().cache[3]);
    }
};

describe('ViewCache', function () {

    describe("#put(timeWindow, array)", function(){

        it('should store the array in cache[0][0]', function() {
            ViewCache.put(timeWindowL0, randomArray(2));
            var state = ViewCache.state();
            expect(ViewCache.state().cache[0][0].length).to.be.equal(2);
            expect(state.viewsIndex["0000"]).to.be.equal(0);
        });

        it('should store the array in cache[1]', function() {
            ViewCache.put(timeWindowL1, randomArray(3));
            expect(ViewCache.state().cache[1][0].length).to.be.equal(3);
            expect(ViewCache.state().viewsIndex['2016']).to.be.equal(0);
        });

        it('should store the array in cache[2]', function() {
            ViewCache.put(timeWindowL2, randomArray(8));
            expect(ViewCache.state().cache[2][0].length).to.be.equal(8);
            expect(ViewCache.state().viewsIndex['201504']).to.be.equal(0);
        });
        it('should store the array in cache[3]', function() {
            ViewCache.put(timeWindowL3, randomArray(7));
            expect(ViewCache.state().cache[3][0].length).to.be.equal(7);
            expect(ViewCache.state().viewsIndex['20170228']).to.be.equal(0);
        });

        it('should NOT store the array in cache[0], cache[1], or cache[2]', function() {
            ViewCache.reset();
            ViewCache.put(timeWindowL3, randomArray(7));
            expect(ViewCache.state().cache[0][0]).to.be.undefined;
            expect(ViewCache.state().viewsIndex['0000']).to.be.undefined;
            expect(ViewCache.state().cache[1][0]).to.be.undefined;
            expect(ViewCache.state().viewsIndex['2016']).to.be.undefined;
            expect(ViewCache.state().cache[2][0]).to.be.undefined;
            expect(ViewCache.state().viewsIndex['201504']).to.be.undefined;
        });

        it('should store ONLY one array per one unique timewindow. The last array prevails', function(){
            ViewCache.reset();
            ViewCache.put(timeWindowL3, randomArray(27));
            ViewCache.put(timeWindowL3, randomArray(4));
            expect(ViewCache.state().cache[3][0].length).to.be.equal(4);
            expect(ViewCache.state().cache[3][1]).to.be.undefined;
        });

        it('should store not more than 2^[level] elements on each cache[level].', function(){

            ViewCache.reset();

            var timeWindowsL1 = generateTimeWindows(1,4);
            // console.log(timeWindowsL1);
            fillViewCache(ViewCache, timeWindowsL1);
            expect(ViewCache.state().cache[1].length).to.be.equal(2);

            var timeWindowsL2 = generateTimeWindows(2, 5);
            // console.log(timeWindowsL2);
            fillViewCache(ViewCache, timeWindowsL2);
            expect(ViewCache.state().cache[2].length).to.be.equal(4);

            var timeWindowsL3 = generateTimeWindows(3, 10);
            // console.log(timeWindowsL3)
            fillViewCache(ViewCache, timeWindowsL3);
            expect(ViewCache.state().cache[3].length).to.be.equal(8);

        });
    });

    describe("#extract(timeWindow)", function () {
        it('should give back array, recently stored for timeWindow', function() {
            ViewCache.reset();
            ViewCache.put(timeWindowL0, randomArray(2));
            ViewCache.put(timeWindowL1, randomArray(3));
            ViewCache.put(timeWindowL2, randomArray(8));
            ViewCache.put(timeWindowL3, randomArray(7));
            expect(ViewCache.extract(timeWindowL0).length).to.be.equal(2);
            expect(ViewCache.extract(timeWindowL1).length).to.be.equal(3);
            expect(ViewCache.extract(timeWindowL2).length).to.be.equal(8);
            expect(ViewCache.extract(timeWindowL3).length).to.be.equal(7);
        });

        it('should give back null, when nothing is found for provided timeWindow', function() {
            var timeWindow = MyDates.twToString(new TimeWindow().set({year: 2018, month: 4}), '');
            expect(ViewCache.extract(timeWindow)).to.be.null;
        });

    });

});