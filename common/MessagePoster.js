/**
 * Created by py on 05/08/16.
 */

var MessagePoster;

var MessagePayload = require('../common/MessagePayload');
var ExpenseMessagePayload = require('../common/ExpenseMessagePayload');
var Message = require('../common/Message');
var Shared = require('../common/Shared');
var MyDates = require('../common/MyDates');
var PusherClient = require('../common/PusherClient');
var guid = require('../common/guid');

// param: Object state
// function: object constructor
// return: MessagePoster object
MessagePoster = function (state) {
    var self = this;
    var shared = Shared.getInstance();
    var http = shared.service.http;

    // param: Object state
    // function: setup static parameters of Day object
    // return: self, so method can be chained.
    self.setUp = function(state) {
        self.dateString = state.currentDay;
        self.dateUTC = 0;
        self.currentItemId = undefined;
        self.pushListener = {};

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
        return self;
    };

    // param: Object state
    // function: decides, whether Form should be shown in HTML. Writes decision to self.html.isShown
    // return: self, so method can be chained
    self.setIsShown = function (state) {
        state.currentItem !== undefined ? self.html.isShown = true : self.html.isShown = false;
        return self;
    };

    // param: Object state
    // function: change the dateSting of the MessagePoster.
    // return: self, so method can be chained.
    self.setDateStringAndPostURL = function (state) {
        self.dateString = state.currentDay;
        self.postUrl = 'api/v1/message/'.concat(self.dateString);
        return self;
    };

    // param: Object state
    // function: set the selected Item from state
    // return: self, so method can be chained.
    self.setSelectedItem = function (state) {
        if(state.currentItem !== undefined) {
            self.currentItemId = state.currentItem._id;
            self.html.amount.value = state.currentItem.amount;
            self.html.description.value = state.currentItem.description;
            self.html.isPlanned = !state.currentItem.labels.isConfirmed;
            self.html.isDeleted = state.currentItem.labels.isDeleted;
        }
        return self;
    };

    // param: Object state
    // function: set the expense poster position to near the clicked item
    // return: self, so method can be chained.
    self.setPopUpStyle = function (state) {
        if(state.currentItem !== undefined) {
            var clickedRect = state.currentItem.boundingClientRect;
            self.html.style.left = clickedRect.left + clickedRect.width;
            self.html.style.top = clickedRect.top - 42;
            self.html.style.width = clickedRect.width * 1.5;
        }
        return self;
    };

    // param: ExpenseData message - the packed ExpenseData object to be sent over http to server
    // function: posts message to server. If succeed, changes self.postSuccess to true. It will tell pfinAppCtrl to
    // trigger the update event and AppView will be updated.
    // Throws error, if failed to do so.
    // return: void
    self.save = function(message) {

        http.post(self.postUrl, message).then(function success (response) {
            console.log(response.data);
            var currentItem = shared.state.currentItem;
            currentItem.isItemProcessing = false;
            Shared.change('currentItem', undefined);
            Shared.change('isUpdated', true);
        }, function error (response){
            throw new Error('failed to post message to ' + self.postUrl);
        });
    };

    // param: void
    // function: assemble expected ExpenseData from 'self'
    // return: Message
    self.assembleMessage = function(clientToken) {
        var dayCode = self.dateString;
        var p = new MessagePayload(
            dayCode,
            {
            isPlan: self.html.isPlanned,
            isDeleted: self.html.isDeleted
            }
        );
        var emp = new ExpenseMessagePayload(p, self.html.amount.value, self.html.description.value, self.currentItemId);
        var user = Shared.getInstance().user;
        return new Message(user._id, 1, 1, emp, clientToken);

    };

    // param: String btn - name of the clicked button
    // function: handle btn click in the form - assemble Message and send it over the http to save into DB.
    // return: void
    self.handleClick = function (btn) {
        var message;
        if(btn === 'delete') {
            self.html.isDeleted = true;
        }
        var currentItem = shared.state.currentItem;
        currentItem.isItemProcessing = true;
        var token = guid();
        self.pushListener = new PusherClient(token);
        message = self.assembleMessage(token);
        self.save(message);
    };

    // param: Object state
    // function: change self.html parameters according to 'state'
    // return: void
    self.update = function(state){
        self.initHTML()
            .setIsShown(state)
            .setDateStringAndPostURL(state)
            .setSelectedItem(state)
            .setPopUpStyle(state);
    };

    // MAIN LOOP
    self.setUp(state)
        .update(state);
};

module.exports = MessagePoster;