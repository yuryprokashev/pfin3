exports.pfinAppCtrl = function ($scope, $views, $user) {
    var Shared = require('../../common/Shared');
    var MyDates = require('../../common/MyDates');
    var state = Shared.getInstance().state;

    $scope.user = $user.user;
    $scope.$watch('user', function (newVal, oldVal) {
        Shared.change("user", newVal);
    });

    $scope.view = $views.initAppView();

    $scope.$watch('view.state.isUpdated', function (newVal, oldVal) {
        if(newVal === true) {
            $scope.view.update(state);
            Shared.change('isUpdated', false);
        }
    });

    // param: String newDay - the day in string format "YYYYMMDD" for which we want to get week number (from 0 to 3-5)
    // function: calculate the number of week, where given day belongs to.
    // return: int weekNum
    var getWeekForDay = function(newDay) {
        var y = MyDates.getYearFromString(newDay);
        var m = MyDates.getMonthFromString(newDay);
        var d = MyDates.getDateFromString(newDay);
        var date = new Date(y, m - 1, d);
        return MyDates.numberOfWeek(date);
    };

    $scope.$on('update::month', function (event, args) {
        var newDay, newWeek;

        if(args.newMonth !== undefined) {
            Shared.change('currentMonth', args.newMonth);

            newDay = MyDates.getDateFromString(state.currentDay);
            if(newDay > MyDates.daysInMonth(state.currentMonth)) {
                newDay = MyDates.daysInMonth(state.currentMonth);
            }
            newDay = state.currentMonth + MyDates.dayToString(newDay);
            Shared.change('currentDay', newDay);

            newWeek = getWeekForDay(newDay);
            Shared.change('currentWeek', newWeek);
        }

        if(args.newWeek !== undefined) {

            newDay = MyDates.getDateFromString(state.currentDay);
            newDay = Number(newDay) + 7 * (args.newWeek - state.currentWeek);
            if(newDay > MyDates.daysInMonth(state.currentMonth)) {
                newDay = MyDates.daysInMonth(state.currentMonth);
            }
            else if(newDay < 1) {
                newDay = 1;
            }
            newDay = state.currentMonth + MyDates.dayToString(newDay);
            Shared.change('currentDay', newDay);
            Shared.change('currentWeek', args.newWeek);
        }

        $scope.view.update(state);
    });

    $scope.$on('update::item', function (event, args) {
        Shared.change('currentItem', args.currentItem);
        Shared.change('currentDay', args.currentItem.dayCode);
        Shared.change('currentWeek', getWeekForDay(args.currentItem.dayCode));
        $scope.view.update(state);
    });

    $scope.$on('update::day', function (event, args) {
        var newDay = state.currentMonth + MyDates.dayToString(args.newDay);
        Shared.change('currentItem', undefined);
        Shared.change('currentDay', newDay);
        Shared.change('currentWeek', getWeekForDay(newDay));
        $scope.view.update(state);
    });

    $user.getUser(function success(){
        $scope.user = $user.user;
    });
};