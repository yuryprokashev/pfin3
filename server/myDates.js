

module.exports = function( wagner ) {

    var s = {};

    s.monthIdIsValid = function ( monthIdString ) {
        return ( monthIdString.length === 6 ) || ( monthIdString.length === 5 );
    };

    s.getMonth = function( monthIdString ) {
        return monthIdString.length === 6 ? Number(monthIdString.substring(4,6)) : Number(monthIdString.substring(4,5));
    };

    s.getYear = function( monthIdString ) {
        return Number(monthIdString.substring(0, 4));
    };

    s.daysInMonth = function( monthIdString ) {
        // gets 'month' as string, e.g. '20161'
        // returns number of calendar days in this month. Takes leap year into account.
        // 1. Setup.
        var number = 30;
        var month = s.getMonth( monthIdString );
        var year = s.getYear(monthIdString);

        // 2. Logic.
        if (month % 2 === 0 || month === 0) {
            number = 31;
        }
        else if (month === 1) {
            if (year % 4 === 0){
                number = 29;
            }
            else {
                number = 28;
            }
        }
        else if (month % 2 === 1 && month !== 1){
            number = 30;
        }
         // 3. Return result.
        return number;
    };

    s.getDaysInSelectedMonth = function( monthIdString ) {
        // gets 'month' as string, e.g. '20168'
        // returns number of days in this month, and when month current, it returns the number of days, actually passed in this month.
        // made for aggregation query, when calculating 'monthlySpentSpeed'.

        // 1. Setup.

        // 2.Logic.
        var monthIsCurrent = s.getMonth( monthIdString ) === new Date().getMonth();

        var result = monthIsCurrent ? new Date().getDate() : s.daysInMonth( monthIdString );

        // 3.Return result.
        return result;
    };

    wagner.factory( 'MyDates', function() { return s; } );

    //console.log('myDates imported');
    //console.log(s);

    return s;
};
