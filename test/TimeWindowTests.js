var expect = require('chai').expect;
var TimeWindow = require('../common/TimeWindow');

var timeWindowL0Mock1 = new TimeWindow();
var timeWindowL1Mock1 = new TimeWindow();
var timeWindowL2Mock1 = new TimeWindow();
var timeWindowL2Mock2 = new TimeWindow();
var timeWindowL2Mock3 = new TimeWindow();
var timeWindowL2Mock4 = new TimeWindow();
var timeWindowL3Mock1 = new TimeWindow();

describe('TimeWindow', function () {
    it('It should have startDate and endDate properties', function() {
        expect(timeWindowL0Mock1).to.have.property('startDate');
        expect(timeWindowL0Mock1).to.have.property('endDate');
    });

    it('It should have only year attribute when args has only year', function () {
        timeWindowL1Mock1.set({year:2016});
        expect(timeWindowL1Mock1.year).to.be.not.null;
        expect(timeWindowL1Mock1.month).to.be.null;
        expect(timeWindowL1Mock1.day).to.be.null;
    });

    it('It should have only year and month attribute when args has year and month', function () {
        timeWindowL2Mock1.set({year: 2016, month: 10});
        expect(timeWindowL2Mock1.year).to.be.not.null;
        expect(timeWindowL2Mock1.month).to.be.not.null;
        expect(timeWindowL2Mock1.day).to.be.null;
    });

    it('It should have year, month and day attribute when args has year, month and day', function () {
        timeWindowL3Mock1.set({year: 2016, month: 10, day: 18});
        expect(timeWindowL3Mock1.year).to.be.not.null;
        expect(timeWindowL3Mock1.month).to.be.not.null;
        expect(timeWindowL3Mock1.day).to.be.not.null;
    });

    it("It should have startDate equal yyyy-01-01 and endDate equal yyyy+1-01-01, if args has only year", function(){
        timeWindowL1Mock1.set({year:2016});
        expect(timeWindowL1Mock1.startDate.getDate()).to.be.equal(1);
        expect(timeWindowL1Mock1.endDate.getDate()).to.be.equal(1);
        expect(timeWindowL1Mock1.startDate.getMonth()).to.be.equal(0);
        expect(timeWindowL1Mock1.endDate.getMonth()).to.be.equal(0);
        expect(timeWindowL1Mock1.startDate.getFullYear()).to.be.equal(2016);
        expect(timeWindowL1Mock1.endDate.getFullYear()).to.be.equal(2017);

    });

    it("It should have startDate equal yyyy-mm-01, and endDate equal to yyyy-mm+1-01, if args has only year and month", function(){
        timeWindowL2Mock1.set({year:2016, month: 2});
        expect(timeWindowL2Mock1.startDate.getDate()).to.be.equal(1);
        expect(timeWindowL2Mock1.endDate.getDate()).to.be.equal(1);
        expect(timeWindowL2Mock1.startDate.getMonth()).to.be.equal(1);
        expect(timeWindowL2Mock1.endDate.getMonth()).to.be.equal(2);
        expect(timeWindowL2Mock1.startDate.getFullYear()).to.be.equal(2016);
        expect(timeWindowL2Mock1.endDate.getFullYear()).to.be.equal(2016);
    });

    it("If (args.month = N) AND (N > 0) then this.month = N - 1", function(){
        timeWindowL2Mock1.set({year:2016, month:3});
        expect(timeWindowL2Mock1.startDate.getMonth() ).to.be.equal(timeWindowL2Mock1.month - 1);
    });

    it("If (args.month = N) AND (N < 0) then this.month = N + 12", function(){
        timeWindowL2Mock1.set({year:2016, month:-1});
        expect(timeWindowL2Mock1.startDate.getMonth() ).to.be.equal(11);
        timeWindowL2Mock1.set({year:2016, month:-2});
        expect(timeWindowL2Mock1.startDate.getMonth() ).to.be.equal(10);
        timeWindowL2Mock1.set({year:2016, month:-3});
        expect(timeWindowL2Mock1.startDate.getMonth() ).to.be.equal(9);
        timeWindowL2Mock1.set({year:2016, month:-12});
        expect(timeWindowL2Mock1.startDate.getMonth() ).to.be.equal(0);
    });
    
});