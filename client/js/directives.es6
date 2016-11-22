exports.notLoggedIn = function() {
    return {
        templateUrl: "/assets/templates/notLoggedIn.html",
        link: function(scope, el, attr, ctrl) {
        }
    }
};

exports.monthSwitch = function () {
    return {
        scope: {
            self: "=extMonthSwitch"
        },
        templateUrl: "/assets/templates/monthSwitch.html",
        link: function (scope, el, attr, ctrl) {
            scope.$emit('directive::monthSwitch::ready', {monthRef: scope.self.monthRef});
            el.on('click', function(event){
                event.target.blur(); // -> remove blue frame (focus) from btn after click
            });
        }
    }
};

exports.progress = function() {
    return {
        replace: true,
        scope: {
            self: "=extProgress"
        },
        templateUrl: "/assets/templates/progress.html",
        link: function(scope, el, attr, ctrl) {
        }
    }
};

exports.calendar = function () {
    return {
        scope:{
            self:"=extCalendar"
        },
        templateUrl: "/assets/templates/calendar.html",
        link: function (scope, el, attr, ctrl) {
            // scope.$emit('directive::calendarView::ready')
        }
    }
};

exports.week = function () {
    return {
        scope:{
            self:"=extWeek"
        },
        templateUrl: "/assets/templates/week.html",
        link: function (scope, el, attr, ctrl) {

        }
    }
};

exports.day = function () {
    return {
        scope:{
            self:"=extDay"
        },
        templateUrl: "/assets/templates/day.html",
        link: function (scope, el, attr, ctrl) {
            const enableDrop = require('./enableDrop.es6');

            scope.$emit('compiled::day', {day: scope.self});

            el.on('click', function (event) {
                event.stopImmediatePropagation();
                scope.$evalAsync(scope.$emit('clicked::day', {day: scope.self}));
            });
            enableDrop(el, scope);
        }
    }
};

exports.messageForm = function() {
    return {
        scope: {
            self: "=extMessage"
        },
        templateUrl: "/assets/templates/messageForm.html",
        link: function (scope, el, attr, ctrl) {
        }
    }
};

exports.item = function() {
    return {
        replace: true,
        scope: {
            self: "=extItem"
        },
        templateUrl: "/assets/templates/item.html",
        link: function (scope, el, attr, ctrl) {
            const enableDrag = require('./enableDrag.es6');

            scope.self.isItemProcessing = false;
            scope.self.boundingClientRect = el[0].getBoundingClientRect();
            scope.$emit("compiled::item", {item: scope.self});

            // this handler selects clicked item
            el.on('click', function (event) {
                event.stopImmediatePropagation();
                scope.self.boundingClientRect = el[0].getBoundingClientRect();
                scope.$emit('clicked::item', {item: scope.self});
            });

            enableDrag(el, scope);
        }
    }
};


exports.ctxMenuBtn = function(){
    return {
        scope: {
            self: "=extCtxMenu"
        },
        templateUrl: "/assets/templates/ctxMenuBtn.html",
        link: function (scope, el, attr, ctrl) {
            el.on('click', function(event){
                // event.stopImmediatePropagation();
                console.log('ctx menu clicked');
                scope.self.rect = el[0].getBoundingClientRect();
                scope.$emit('clicked::ctxMenu', {ctxMenu: scope.self})
            });
        }
    }
};

exports.keypressEvents = ["$document", "$rootScope", function($document, $rootScope){
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            let handler = require('./directiveEventHandlers/handleKeyPress.es6');
            $document.on('keydown',
                (function(s) {
                    return function(event) {
                        handler(event,s);
                    };
                })(scope)
            );
        }
    }
}];
