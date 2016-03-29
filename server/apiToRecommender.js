module.exports = function( wagner ) {

    var s = {};

    var Expense = wagner.invoke( function (Expense) {
        return Expense;
    });

    s.createRecommendations = function( user ) {
        //> take expenses within one past week from Expense model
        var expensesDuringPastWeek = [];
        var today = new Date();
        var aWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

        Expense.find().
        where( 'user' ).equals( user._id ).
        where( 'date' ).equals( aWeekAgo ).
        where( 'labels.isDeleted' ).equals( false ).
        where( 'labels.isConfirmed' ).equals( true ).
        populate( 'category currency' ).
        sort('-date').
        exec( function (err, data ) {
            if( err ) {
                console.log( err );
            }
            else {
                expensesDuringPastWeek = data;
            }
        });

        //> create a new set of expenses based on found data
        for( var i in expensesDuringPastWeek ) {
            var e = expensesDuringPastWeek[i];
            Expense.create({
                _id: require( './guid' )(),
                date: e.date,
                amount: e.amount,
                currency: e.currency,
                category: e.category,
                description: e.description,
                user: e.user,
                labels: {
                    isDeleted: false,
                    isConfirmed: false
                }
            }, function (err, result) {
                console.log('ok');
            });
        }
    };

    wagner.factory( 'ApiToRecommender', function() { return s; } );

    return s;
};
