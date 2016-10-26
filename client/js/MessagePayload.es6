/**
 * Created by py on 05/08/16.
 */

var MessagePayload;

// param: String dayCode - formatted string "YYYYMMDD", where this Message is attributed to.
// This is NOT a creation date, or stored date.
// This date is used to show the Message in appropriate Day in Calendar
// param: Object labels - collection of flags {isPlan: false}, {isDeleted: false}.
MessagePayload = function(dayCode, labels) {
    if(dayCode === undefined || typeof dayCode !== 'string' || dayCode.length !== 8) {
        throw new Error('dayCode is either undefined, or not String, or not 8 chars long');
    }
    else {
        this.dayCode = dayCode;
        this.monthCode = dayCode.substring(0,6);
    }
    if(labels.isPlan === undefined || labels.isDeleted === undefined) {
        throw new Error('labels object does not have mandatory key-values (isPlan and isDeleted expected)');
    }
    else {
        this.labels = labels;
    }
};

module.exports = MessagePayload;