angular.module('myApp')
    .controller('TimerCtrl', function($scope, $timeout) {
        var timer = null;
        var data = JSON.parse(localStorage.getItem("storage"));
        if(data != null) {
            $scope.tasks = data;
        }
        if(data == null) {
            $scope.tasks = [];
        }
        $scope.times = {
            minutes: "00",
            seconds: "00"
        };
        var _pad = function(length) {
            var res = "";
            while (res.length < length)
                res = '0' + res;
            return res;
        };
        $scope.buttonCtrl = 0;
        $scope.startTimer = function() {
            $scope.times.seconds++;
            timer = $timeout($scope.startTimer, 1000);
            if($scope.times.seconds === 60) {
                $scope.times.minutes++;
                if($scope.times.minutes < 10) {
                    $scope.times.minutes = _pad(1) + $scope.times.minutes;
                }
                $scope.times.seconds = "00";
            }
            if($scope.times.seconds < 10) {
                $scope.times.seconds = _pad(1) + $scope.times.seconds;
            }
            if($scope.times.seconds === "000") {
                $scope.times.seconds = "00";
            }
            if($scope.newTask.curr == null) {
                $scope.newTask.curr = " ₽ / час";
            }
            $scope.buttonCtrl = 1;
        };
        var formatTotal = new Intl.NumberFormat("ru", {
            style: "currency",
            currency: "RUB"
        });
        $scope.newTask = {
            curr: " ₽ / час"
        };
        $scope.stopTimer = function() {
            $timeout.cancel(timer);
            timer = null;
            $scope.tasks.push($scope.newTask);
            if($scope.newTask.name == null) {
                $scope.newTask.name = "без названия";
            }
            if($scope.newTask.cost == null) {
                $scope.newTask.cost = 0;
            }
            $scope.newTask.time = $scope.times.minutes + ":" + $scope.times.seconds;
            var tms = +$scope.times.minutes * 60 + +$scope.times.seconds;
            var total = $scope.newTask.cost / 3600 * tms;
            var tmin = ($scope.newTask.time.substr(0, 1) === "0") ? $scope.newTask.time.substr(1, 1) :
                $scope.newTask.time.substr(0, 2);
            var tsec = ($scope.newTask.time.substr(3, 1) === "0") ? $scope.newTask.time.substr(4, 1) :
                $scope.newTask.time.substr(3, 2);
            $scope.newTask.overall = (tmin === "0") ? tsec + " сек." + " = " + formatTotal.format(total) :
                tmin + " мин." + tsec + " сек." + " = " + formatTotal.format(total);
            $scope.newTask = {
                name: null,
                cost: null,
                time: null,
                curr: " ₽ / час"
            };
            $scope.times.minutes = "00";
            $scope.times.seconds = "00";
            var data = $scope.tasks;
            localStorage.setItem("storage", JSON.stringify(data));
            $scope.buttonCtrl = 0;
        };
        $scope.delete = function(task) {
            var index = $scope.tasks.indexOf(task);
            $scope.tasks.splice(index, 1);
            var data = $scope.tasks;
            localStorage.setItem("storage", JSON.stringify(data));
        };
        $scope.edit = function(task) {
            $scope.activeTask = task;
        };
        $scope.update = function(task) {
            var tms = +$scope.activeTask.time.substr(0,2) * 60 + +$scope.activeTask.time.substr(3,2);
            var total = $scope.activeTask.cost / 3600 * tms;
            var tmin = ($scope.activeTask.time.substr(0,1) === "0") ? $scope.activeTask.time.substr(1,1) :
                $scope.activeTask.time.substr(0,2);
            var tsec = ($scope.activeTask.time.substr(3,1) === "0") ? $scope.activeTask.time.substr(4,1) :
                $scope.activeTask.time.substr(3,2);
            $scope.activeTask.overall = (tmin === "0") ? tsec + " сек." + " = " + formatTotal.format(total):
            tmin + " мин." + tsec + " сек." + " = " + formatTotal.format(total);
            $scope.activeTask = null;
            var data = $scope.tasks;
            localStorage.setItem("storage", JSON.stringify(data));
        };        
    });