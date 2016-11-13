/**
 *Created by py on 01/11/2016
 */

function decideIsCurrentMonthClicked(month, scope) {
    return scope.state.monthRef.monthString === month.monthString;
}
module.exports = decideIsCurrentMonthClicked;