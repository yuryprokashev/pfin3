/**
 * Created by py on 05/08/16.
 */

var MessagePoster;

var MessagePayload = require('./MessagePayload');
var ExpenseMessagePayload = require('./ExpenseMessagePayload');
var Message = require('./Message');
var MyDates = require('./MyDates');
var guid = require('./guid');

// param: Object state
// function: object constructor
// return: MessagePoster object
MessagePoster = function (state) {
    var self = this;
    self.state = state;

    function isLastDayOfWeekSelected (day){
        return day.weekDayNum === 6;
    }

    // param: Object state
    // function: setup static parameters of Day object
    // return: self, so method can be chained.
    self.setUp = function() {
        self.dateString = self.state.dayRef.timeWindow;
        self.dateUTC = 0;
        self.currentItemId = undefined;
        // self.pushListener = {};
        return self;
    };

    // param: void, since it is just initialization
    // function: init self.html object, which is exposed to HTML template
    // return: self, so method can be chained.
    self.initHTML = function () {
        self.html = {};
        self.html.isShown = false;
        self.html.amount = {
            placeholder: 'Expense amount',
            value: 0
        };
        self.html.description = {
            placeholder: 'Describe the expense... E.g. "Car. Gas", or "Food. Lunch"',
            value: ''
        };
        self.html.isPlanned = false;
        self.html.isDeleted = false;

        self.html.style = {
            position: 'fixed',
            left: 0,
            top: 0,
            width: 0,
            'z-index': 1
        };
        self.html.isLastDayOfWeekSelected = function (){
            return isLastDayOfWeekSelected(self.state.dayRef);
        };
        return self;
    };

    // param: Object state
    // function: decides, whether Form should be shown in HTML. Writes decision to self.html.isShown
    // return: self, so method can be chained
    self.setIsShown = function () {
        self.html.isShown = self.state.isFormShown;
        return self;
    };

    // param: Object state
    // function: change the dateSting of the MessagePoster.
    // return: self, so method can be chained.
    self.setDateStringPostURL = function () {
        self.dateString = self.state.dayRef.timeWindow;
        // self.postUrl = 'api/v1/message/'.concat(self.dateString);
        self.postUrl = `api/v1/message/${self.dateString}`;
        return self;
    };



    // param: Object state
    // function: set the expense poster position to near the clicked item
    // return: self, so method can be chained.
    self.setPopUpStyle = function () {
        if(state.isFormShown === true) {
            // console.log(self.state.dayRef);
            var clickedRect = self.state.itemRef.boundingClientRect;
            self.html.style.top = clickedRect.top - 42;
            self.html.style.width = clickedRect.width * 1.5;
            if(isLastDayOfWeekSelected(self.state.dayRef)){
                self.html.style.left = clickedRect.left - 1.45 * clickedRect.width;
            }
            else {
                self.html.style.left = clickedRect.left + clickedRect.width;
            }
        }
        return self;
    };


    // param: void
    // function: assemble expected ExpenseData from 'self'
    // return: Message
    self.assembleMessage = function(btnClicked, clientToken) {
        if(btnClicked === 'delete'){
            self.html.isDeleted = true;
        }
        var dayCode = self.dateString;
        var p = new MessagePayload(
            dayCode,
            {
            isPlan: self.html.isPlanned,
            isDeleted: self.html.isDeleted
            }
        );
        var emp = new ExpenseMessagePayload(p, self.html.amount.value, self.html.description.value, self.currentItemId);
        var user = self.state.user._id;
        // console.log(self.state.user);
        return new Message(user, 1, 1, emp, clientToken);

    };

    // param: Object state
    // function: change self.html parameters according to 'state'
    // return: void
    self.update = function(){
        self.setIsShown()
            .setDateStringPostURL()
            .setSelectedItem()
            .setPopUpStyle();
    };

    // MAIN LOOP
    self.setUp()
        .initHTML()
        .update();
};

// param: Object state
// function: set the selected Item from state
// return: self, so method can be chained.
MessagePoster.prototype.setSelectedItem = function(){
    var self = this;
    if(self.state.itemRef !== undefined) {
        self.item = self.state.itemRef;
        self.currentItemId = self.item._id;
        self.html.amount.value = self.item.amount;
        self.html.description.value = self.item.description;
        self.html.isPlanned = self.item.labels.isPlan;
        self.html.isDeleted = self.item.labels.isDeleted;
    }
    return self;
};

module.exports = MessagePoster;