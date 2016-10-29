/**
 * Created by py on 05/08/16.
 */

var ExpenseMessagePayload;

// param: MessagePayload p - the base MessagePayload object, that we decorate with Expense attributes
// param: int amount - integer > 0 that is Expense amount
// param: String desc - string description of Expense.
// param: String id - optional parameter, id of existing expense.
// function: Object constructor
// return: ExpenseMessagePayload object
ExpenseMessagePayload = function (p, amount, desc, id) {
    // this.messagePayload = p;
    this.dayCode = p.dayCode;
    this.monthCode = p.monthCode;
    this.labels = p.labels;

    if(amount === undefined || typeof amount !== 'number' || amount < 0) {
        throw new Error('amount is either undefined, or not number, or less than 0');
    }
    else {
        this.amount = amount;
    }

    if(desc === undefined || typeof desc !== 'string') {
        throw new Error('description is either undefined, or not string');
    }
    else {
        this.description = desc;
    }

    if(id === undefined) {
        this.id = null;
    }
    else {
        this.id = id;
    }
};


module.exports = ExpenseMessagePayload;