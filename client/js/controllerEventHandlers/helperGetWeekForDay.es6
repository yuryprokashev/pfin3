/**
 *Created by py on 31/10/2016
 */
'use strict';
const MyDates = require('../MyDates');
// param: String newDay - the day in string format "YYYYMMDD" for which we want to get week number (from 0 to 3-5)
// function: calculate the number of week, where given day belongs to.
// return: int weekNum
function helperGetWeekForDay(newDay) {
        var y = MyDates.getYearFromString(newDay);
        var m = MyDates.getMonthFromString(newDay);
        var d = MyDates.getDateFromString(newDay);
        var date = new Date(y, m - 1, d);
        // console.log(date);
        return MyDates.numberOfWeek(date);
}
module.exports = helperGetWeekForDay;