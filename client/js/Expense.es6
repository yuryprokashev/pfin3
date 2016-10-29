/**
 * Created by py on 26/07/16.
 */

// TODO. Do I need it still here? Where is it used?

var Expense;

Expense = function(args) {

    if(args.user === undefined) {
        throw new Error('user must be defined for Expense creation');
    }
    else {
        this.user = args.user;
    }

    if(args.date === undefined){
        throw new Error('expense date (UTC ms expected) must not be undefined');
    }
    else if(args.date) {
        this.date = args.date;
    }

    if(args.amount <= 0){
        throw new Error('expense amount must be more than 0');
    }
    else if(args.amount > 0){
        this.amount = args.amount;
    }

    this.description = args.description;

    if(args.labels === undefined) {
        this.labels = {isConfirmed: true, isDeleted: false, isDefault: false};
    }
    else {
        this.labels = args.labels;
    }

    if(args.dateCode === undefined || args.dateCode.length !== 8){
        throw new Error('dateCode is either undefined, or wrong length ("YYYYMMDD" format is expected)')
    }
    else {
        this.dateCode = dateCode;
    }
};
module.exports = Expense;