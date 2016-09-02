exports.monthSwitch = function () {
    return {
        scope: {
            self: "=extMonthSwitch"
        },
        templateUrl: "/assets/templates/monthSwitch.html",
        link: function (scope, el, attr, ctrl) {
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
            el.on('click', function (event) {
                event.stopImmediatePropagation();
                scope.$emit('update::day', {newDay: scope.self.dayNum});
            })
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
        scope: {
            self: "=extItem"
        },
        templateUrl: "/assets/templates/item.html",
        link: function (scope, el, attr, ctrl) {

            scope.self.isItemProcessing = false;

            // this handler selects clicked item
            el.on('click', function (event) {
                event.stopImmediatePropagation();
                scope.self.boundingClientRect = el[0].getBoundingClientRect();
                scope.$emit('update::item', {currentItem: scope.self});
            })
        }
    }
};
