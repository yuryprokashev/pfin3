var expect = require('chai').expect;
var MyDates = require('../common/MyDates');

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
            year = Math.floor(Math.random() * 2050);
            month = null;
            day = null;
        }
        else if(level === 2) {
            year = Math.floor(Math.random() * 2050);
            month = Math.floor(Math.random() * 12) + 1;
            day = null;
        }
        else if(level === 3) {
            year = Math.floor(Math.random() * 2050);
            month = Math.floor(Math.random() * 12) + 1;
            day = Math.floor(Math.random() * 27) + 1;
        }
        result.push(new TimeWindow({year: year, month: month, day: day}));
    }
    return result;
};

var fillViewCache = function(viewCache, timeWindowArray) {
    for(var i = 0 ; i < timeWindowArray.length; i++) {
        viewCache.put(timeWindowArray[i], randomArray(Math.floor(Math.random() * 5) + 1));
        // console.log(viewCache.showState.cache[3]);
    }
};


describe('MyDates', function () {

    describe("#daysInMonth(string)", function(){

        it('should give 31 for "201601"', function() {
            expect(MyDates.daysInMonth("201601")).to.be.equal(31);
        });
        it('should give 29 for "201602"', function() {
            expect(MyDates.daysInMonth("201602")).to.be.equal(29);
        });
        it('should give 31 for "201603"', function() {
            expect(MyDates.daysInMonth("201603")).to.be.equal(31);
        });
        it('should give 30 for "201604"', function() {
            expect(MyDates.daysInMonth("201604")).to.be.equal(30);
        });
        it('should give 31 for "201605"', function() {
            expect(MyDates.daysInMonth("201605")).to.be.equal(31);
        });
        it('should give 30 for "201606"', function() {
            expect(MyDates.daysInMonth("201606")).to.be.equal(30);
        });
        it('should give 31 for "201607"', function() {
            expect(MyDates.daysInMonth("201607")).to.be.equal(31);
        });
        it('should give 31 for "201608"', function() {
            expect(MyDates.daysInMonth("201608")).to.be.equal(31);
        });
        it('should give 30 for "201609"', function() {
            expect(MyDates.daysInMonth("201609")).to.be.equal(30);
        });
        it('should give 31 for "201610"', function() {
            expect(MyDates.daysInMonth("201610")).to.be.equal(31);
        });
        it('should give 30 for "201611"', function() {
            expect(MyDates.daysInMonth("201611")).to.be.equal(30);
        });
        it('should give 31 for "201612"', function() {
            expect(MyDates.daysInMonth("201612")).to.be.equal(31);
        });
        it('should give 28 for "201502"', function() {
            expect(MyDates.daysInMonth("201502")).to.be.equal(28);
        });
        it('should give 29 for "202002"', function() {
            expect(MyDates.daysInMonth("202002")).to.be.equal(29);
        });

    });

    describe("#explode(timeWindow, range)", function() {
        describe("normal input data", function () {
            it('should return Array with three elements, and each element has to be TimeWindow object when input is "", [-1,1]', function(){
                expect(MyDates.explode("0000", [-1,1]).length).to.be.equal(3);
                expect(MyDates.explode("0000", [-1,1])[0]).to.have.property("startDate");
                expect(MyDates.explode("0000", [-1,1])[0]).to.have.property("endDate");
                expect(MyDates.explode("0000", [-1,1])[0]).to.have.property("year");
                expect(MyDates.explode("0000", [-1,1])[0]).to.have.property("month");
                expect(MyDates.explode("0000", [-1,1])[0]).to.have.property("day");
            });
            it('should return Array with five elements, and first element has to have "month" = todayMonth + 2 when input is "2016", [-2,2]', function(){
                var todayMonth = new Date().getMonth() + 1;
                expect(MyDates.explode("2016", [-2,2]).length).to.be.equal(5);
                expect(MyDates.explode("2016", [-2,2])[0]).to.have.property("startDate");
                expect(MyDates.explode("2016", [-2,2])[0]).to.have.property("endDate");
                expect(MyDates.explode("2016", [-2,2])[0]).to.have.property("year");
                expect(MyDates.explode("2016", [-2,2])[0]).to.have.property("month");
                expect(MyDates.explode("2016", [-2,2])[0]).to.have.property("day");

                expect(MyDates.explode("2016", [-2,2])[0].month).to.be.equal(todayMonth + 2);
            });
        })
    });

    describe("#headingsArray( timeWindowArray, string)", function () {
        it("should return array of strings", function(){
            var twArray = MyDates.explode("0000", [0, 0]);
            expect(MyDates.headingsArray(twArray, '-')).to.be.eql(["2016"]);
        });

        it("should return array of strings", function(){
            var twArray = MyDates.explode("2016", [-1,1], "201606");
            expect(MyDates.headingsArray(twArray, '-')).to.be.eql(["2016-07", "2016-06", "2016-05"]);
        });
    });

    describe('#stringToTimeWindow(t)', function () {
        it('should return TimeWindow object', function () {
            var r1 = MyDates.stringToTw('2016');
            expect(r1.year).to.be.equal(2016);
            expect(r1.month).to.be.equal(null);
            expect(r1.day).to.be.equal(null);
            expect(r1.startDate.getFullYear()).to.be.equal(2016);
        });
    });

    describe('#timeWindowToFormattedString(t)', function(){
        it('should return formatted string for timeWindow object', function(){
            var tw = MyDates.stringToTw('201601');
            var r1 = MyDates.twToString(tw, '');
            expect(r1).to.be.equal('201601');
        });
    });

    describe('#getParent(string)', function(){

        it('should return null, if child timewindow is "0000"', function () {
            expect(MyDates.parent("0000")).to.be.equal(null);
        });
        it('should return 0000 if child timewindow = "2016"', function () {
            expect(MyDates.parent("2016")).to.be.equal("0000");
            expect(MyDates.parent("2015")).to.be.equal("0000");
        });
        it('should return 2016 if child timewindow = "201606"', function () {
            expect(MyDates.parent("201606")).to.be.equal("2016");
            expect(MyDates.parent("201512")).to.be.equal("2015");
        });
        it('should return 201604 if child timewindow = "20160430"', function () {
            expect(MyDates.parent("20160430")).to.be.equal("201604");
            expect(MyDates.parent("20151231")).to.be.equal("201512");
        });

    });

    describe('#getNeighbours(t, range)', function () {
        it('should return array of length 3 for t="201607" and range = [-1,1]', function () {
            expect(MyDates.neighbours("201607", [-1,1]).length).to.be.equal(3);
        });
        it('should have TimeWindow objects as elements', function(){
            expect(MyDates.neighbours("201607", [-2,2])[0]).to.have.property("startDate");
            expect(MyDates.neighbours("201607", [-2,2])[0]).to.have.property("endDate");
            expect(MyDates.neighbours("201607", [-2,2])[0]).to.have.property("year");
            expect(MyDates.neighbours("201607", [-2,2])[0]).to.have.property("month");
            expect(MyDates.neighbours("201607", [-2,2])[0]).to.have.property("day");
        });
        it('should have middle element of Array to be equal to given argument (timeWindow t)', function () {
            expect(MyDates.neighbours("201609", [-1,1])[1].month).to.be.equal(9);
            expect(MyDates.neighbours("201609", [-1,1])[0].month).to.be.equal(10);
            expect(MyDates.neighbours("201609", [-1,1])[2].month).to.be.equal(8);
        });
        it('should consider that exploded months are outside the current year', function () {
            expect(MyDates.neighbours("201601", [-1,1])[1].month).to.be.equal(1);
            expect(MyDates.neighbours("201601", [-1,1])[2].month).to.be.equal(12);
        });
        it('should give three TimeWindows with year and month that are not null, when input is ("2016",[-1,1], "201601")', function () {
            expect(MyDates.explode("2016", [-1,1], "201601").length).to.be.equal(3);
            expect(MyDates.explode("2016", [-1,1], "201601")[0].year).to.be.equal(2016);
            expect(MyDates.explode("2016", [-1,1], "201601")[0].month).to.be.equal(2);
            expect(MyDates.explode("2016", [-1,1], "201601")[1].year).to.be.equal(2016);
            expect(MyDates.explode("2016", [-1,1], "201601")[1].month).to.be.equal(1);
            expect(MyDates.explode("2016", [-1,1], "201601")[2].year).to.be.equal(2015);
            expect(MyDates.explode("2016", [-1,1], "201601")[2].month).to.be.equal(12);

        });
    });

    describe('#weeksInMonth(String t)', function(){

        it('should give 6 for "201601"', function () {
            expect(MyDates.weeksInMonth("201601")).to.be.equal(6);
        });
        it('should give 5 for "201602"', function () {
            expect(MyDates.weeksInMonth("201602")).to.be.equal(5);
        });
        it('should give 5 for "201603"', function () {
            expect(MyDates.weeksInMonth("201603")).to.be.equal(5);
        });
        it('should give 5 for "201604"', function () {
            expect(MyDates.weeksInMonth("201604")).to.be.equal(5);
        });
        it('should give 5 for "201605"', function () {
            expect(MyDates.weeksInMonth("201605")).to.be.equal(5);
        });
        it('should give 5 for "201606"', function () {
            expect(MyDates.weeksInMonth("201606")).to.be.equal(5);
        });
        it('should give 6 for "201607"', function () {
            expect(MyDates.weeksInMonth("201607")).to.be.equal(6);
        });
        it('should give 5 for "201608"', function () {
            expect(MyDates.weeksInMonth("201608")).to.be.equal(5);
        });
        it('should give 5 for "201609"', function () {
            expect(MyDates.weeksInMonth("201609")).to.be.equal(5);
        });
        it('should give 6 for "201610"', function () {
            expect(MyDates.weeksInMonth("201610")).to.be.equal(6);
        });
        it('should give 5 for "201611"', function () {
            expect(MyDates.weeksInMonth("201611")).to.be.equal(5);
        });
        it('should give 5 for "201612"', function () {
            expect(MyDates.weeksInMonth("201612")).to.be.equal(5);
        });
        it('should give 5 for "20161201"', function () {
            expect(MyDates.weeksInMonth("201612")).to.be.equal(5);
        });
    });

    describe('#firstDay(String t)', function(){
        it('should return Friday for "201601"', function () {
            expect(MyDates.firstDay("201601")).to.be.equal(5);
        });
        it('should return Monday for "201602"', function () {
            expect(MyDates.firstDay("201602")).to.be.equal(1);
        });
        it('should return Tuesday for "201603"', function () {
            expect(MyDates.firstDay("201603")).to.be.equal(2);
        });
        it('should return Friday for "201604"', function () {
            expect(MyDates.firstDay("201604")).to.be.equal(5);
        });
        it('should return Sunday for "201605"', function () {
            expect(MyDates.firstDay("201605")).to.be.equal(0);
        });
        it('should return Wednesday for "201606"', function () {
            expect(MyDates.firstDay("201606")).to.be.equal(3);
        });
        it('should return Friday for "201607"', function () {
            expect(MyDates.firstDay("201607")).to.be.equal(5);
        });
        it('should return Monday for "201608"', function () {
            expect(MyDates.firstDay("201608")).to.be.equal(1);
        });
        it('should return Thursday for "201609"', function () {
            expect(MyDates.firstDay("201609")).to.be.equal(4);
        });
        it('should return Saturday for "201610"', function () {
            expect(MyDates.firstDay("201610")).to.be.equal(6);
        });
        it('should return Tuesday for "201611"', function () {
            expect(MyDates.firstDay("201611")).to.be.equal(2);
        });
        it('should return Thursday for "201612"', function () {
            expect(MyDates.firstDay("201612")).to.be.equal(4);
        });
    });

    describe('#dateToString(Date date)', function () {
        it('should return "20160201" for Date(2016, 1, 1)', function () {
            expect(MyDates.dateToString(new Date(2016, 1, 1))).to.be.equal("20160201")
        });
        it('should return "20160623" for Date(2016, 5, 23)', function () {
            expect(MyDates.dateToString(new Date(2016, 5, 23))).to.be.equal("20160623")
        });
    });

    describe('#dayToString(int dayNum)', function () {
        it('should convert 9 to "09"', function () {
            expect(MyDates.dayToString(9)).to.be.equal("09");
        });
        it('should convert 30 to "30"', function () {
            expect(MyDates.dayToString(30)).to.be.equal("30");
        });
    });

    describe('#numberOfWeek(Date date)', function () {
        it('should return 0 for new Date(2016, 6, 1)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 1))).to.be.equal(0);
        });
        it('should return 1 for new Date(2016, 6, 3)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 3))).to.be.equal(1);
        });
        it('should return 1 for new Date(2016, 6, 9)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 9))).to.be.equal(1);
        });
        it('should return 2 for new Date(2016, 6, 10)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 10))).to.be.equal(2);
        });
        it('should return 2 for new Date(2016, 6, 16)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 16))).to.be.equal(2);
        });
        it('should return 3 for new Date(2016, 6, 17)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 17))).to.be.equal(3);
        });
        it('should return 3 for new Date(2016, 6, 23)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 23))).to.be.equal(3);
        });
        it('should return 4 for new Date(2016, 6, 24)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 24))).to.be.equal(4);
        });
        it('should return 4 for new Date(2016, 6, 30)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 30))).to.be.equal(4);
        });
        it('should return 5 for new Date(2016, 6, 31)', function () {
            expect(MyDates.numberOfWeek(new Date(2016, 6, 31))).to.be.equal(5);
        });
    });

    describe('#now()', function(){
        it('should return number of milliseconds from 1-Jan-1970 00:00:00 UTC', function () {
            expect(MyDates.now()).to.be.a('number');
        })
    })
});