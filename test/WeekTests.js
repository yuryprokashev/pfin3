// /**
//  * Created by py on 26/07/16.
//  */
//
// var expect = require('chai').expect;
// var Week = require('../common/Week');
// var Shared = require('../common/Shared');
//
// describe('Week', function () {
//     describe('#constructor (weekNum, state, isTransformRequired = false)', function(){
//         var state = Shared.getInstance().state;
//         // console.log(state);
//         Shared.change("currentTimeWindow", "201607");
//         var w = new Week(0, state, false);
//         // console.log(w.days);
//         it('should have elements [0]-[4] = null, if weekNum = 0, state.currentMonth = "201607', function () {
//             for(var i = 0; i < 5; i++){
//                 expect(w.days[i]).to.be.equal(null);
//             }
//         });
//         it('should have element [5] !=null and this element timeWindow should be equal "20160701"', function () {
//             expect(w.days[5]).to.be.not.null;
//             expect(w.days[5].timeWindow).to.be.equal("20160701");
//         });
//         it('should have element [0] with timeWindow = "20160703", if weekNum = 1, state.currentMonth = "201607', function(){
//             var w1 = new Week(1, state);
//             expect(w1.days[0].timeWindow).to.be.equal("20160703");
//         });
//     });
//
//     describe("#constructor (weekNum, state, isTransformRequired = true)", function () {
//         var state = Shared.getInstance().state;
//         Shared.change('currentTimeWindow', "201607");
//         var w = new Week(0, state, true);
//         it('should have days array of length 3', function () {
//             expect(w.days.length).to.be.equal(3);
//         });
//
//         it('should have days[0], days[1] array to have all nulls, since input is "201607 - > first week of July starts on Friday"', function () {
//             expect(w.days[0][0]).to.be.equal(null);
//             expect(w.days[0][1]).to.be.equal(null);
//             expect(w.days[0][2]).to.be.equal(null);
//             expect(w.days[1][0]).to.be.equal(null);
//             expect(w.days[1][1]).to.be.equal(null);
//             expect(w.days[1][2]).to.be.equal(null);
//         });
//
//         it('should have days[2] array to have [0] = Day, [1] = Day, [2] = null', function () {
//             expect(w.days[2][0]).to.be.not.null;
//             expect(w.days[2][1]).to.be.not.null;
//             expect(w.days[2][2]).to.be.equal(null);
//         });
//
//         it('should have days[2][0] array to have timeWindow = "20160701"', function () {
//             expect(w.days[2][0].timeWindow).to.be.equal("20160701");
//         });
//         it('should have days[2][1] array to have timeWindow = "20160702"', function () {
//             expect(w.days[2][1].timeWindow).to.be.equal("20160702");
//         });
//     });
// });