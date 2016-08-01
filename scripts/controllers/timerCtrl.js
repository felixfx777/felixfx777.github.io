angular.module('myApp')
    .controller('TimerCtrl', function($scope, $timeout) {
        // добавляем нормальное отображение стоимости. Взял отсюда http://art-blog.ru/blog/topic/49/
        function number_format(_number, _cfg){
            function obj_merge(obj_first, obj_second){
                var obj_return = {};
                for (key in obj_first){
                    if (typeof obj_second[key] !== 'undefined') obj_return[key] = obj_second[key];
                    else obj_return[key] = obj_first[key];
                }
                return obj_return;
            }
            function thousands_sep(_num, _sep){
                if (_num.length <= 3) return _num;
                var _count = _num.length;
                var _num_parser = '';
                var _count_digits = 0;
                for (var _p = (_count - 1); _p >= 0; _p--){
                    var _num_digit = _num.substr(_p, 1);
                    if (_count_digits % 3 == 0 && _count_digits != 0 && !isNaN(parseFloat(_num_digit))) _num_parser = _sep + _num_parser;
                    _num_parser = _num_digit + _num_parser;
                    _count_digits++;
                }
                return _num_parser;
            }
            if (typeof _number !== 'number'){
                _number = parseFloat(_number);
                if (isNaN(_number)) return false;
            }
            var _cfg_default = {before: '', after: '', decimals: 2, dec_point: '.', thousands_sep: ','};
            if (_cfg && typeof _cfg === 'object'){
                _cfg = obj_merge(_cfg_default, _cfg);
            }
            else _cfg = _cfg_default;
            _number = _number.toFixed(_cfg.decimals);
            if(_number.indexOf('.') != -1){
                var _number_arr = _number.split('.');
                var _number = thousands_sep(_number_arr[0], _cfg.thousands_sep) + _cfg.dec_point + _number_arr[1];
            }
            else var _number = thousands_sep(_number, _cfg.thousands_sep);
            return _cfg.before + _number + _cfg.after;
        }
        // Сооружаем таймер и задачник
        var timer = null;
        var data = JSON.parse(localStorage.getItem("storage")); // берем данные из локального хранилища
        // если данных нет, то..
        if(data != null) {
            $scope.tasks = data;
        }
        if(data == null) {
            $scope.tasks = [];
        }
        
        var currTime = JSON.parse(localStorage.getItem("timer")); // таймер не обнуляется при перезагрузке
        if(currTime != null) {
            $scope.times = currTime;
        } else {
            $scope.times = {
                hours: "0",
                minutes: "00",
                seconds: "00"
            };
        }
        // добавляем "0" перед одиночными числами
        var _pad = function(length) {
            var res = "";
            while (res.length < length)
                res = '0' + res;
            return res;
        };
        $scope.buttonCtrl = 0; // скрытие и показ кнопок

        // биндим кнопки
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
            if($scope.times.minutes === "60") {
                $scope.times.hours++;
                $scope.times.minutes = "00";
            }
            if($scope.newTask.curr == null) {
                $scope.newTask.curr = " ₽ / час";
            }
            $scope.buttonCtrl = 1;
            var currTime = $scope.times;
            localStorage.setItem("timer", JSON.stringify(currTime));
        };
        $scope.newTask = {
            curr: " ₽ / час"
        };
        $scope.stopTimer = function() {
            $timeout.cancel(timer);
            timer = null;
            $scope.tasks.push($scope.newTask);
            if ($scope.newTask.name == null) {
                $scope.newTask.name = "без названия";
            }
            if ($scope.newTask.cost == null) {
                $scope.newTask.cost = 0;
            }
            if ($scope.times.hours < 1) {
                $scope.newTask.time = $scope.times.minutes + ":" + $scope.times.seconds;
            } else {
                $scope.newTask.time = $scope.times.hours + ":" + $scope.times.minutes + ":" + $scope.times.seconds;
            }
            var tms = +$scope.times.hours * 3600 + +$scope.times.minutes * 60 + +$scope.times.seconds;
            var total = $scope.newTask.cost / 3600 * tms;
            var thour;
            if($scope.newTask.time.length >= 9) {
                thour = $scope.newTask.time.substr(0, 3);
            } if($scope.newTask.time.length === 8) {
                thour = $scope.newTask.time.substr(0, 2);
            } else {
                thour = $scope.newTask.time.substr(0, 1);
            }
            var tmin;
            if($scope.newTask.time.length >= 8) {
                tmin = ($scope.newTask.time.substr(3, 1) === "0") ? $scope.newTask.time.substr(4, 1) :
                    $scope.newTask.time.substr(3, 2);
            } if($scope.newTask.time.length === 7) {
                tmin = ($scope.newTask.time.substr(2, 1) === "0") ? $scope.newTask.time.substr(3, 1) :
                    $scope.newTask.time.substr(2, 2);
            } else {
                tmin = ($scope.newTask.time.substr(0, 1) === "0") ? $scope.newTask.time.substr(1, 1) :
                    $scope.newTask.time.substr(0, 2);
            }
            var tsec;
            if($scope.newTask.time.length >= 8) {
                tsec = ($scope.newTask.time.substr(6, 1) === "0") ? $scope.newTask.time.substr(7, 1) :
                    $scope.newTask.time.substr(6, 2);
            } if($scope.newTask.time.length === 7) {
                tsec = ($scope.newTask.time.substr(5, 1) === "0") ? $scope.newTask.time.substr(6, 1) :
                    $scope.newTask.time.substr(5, 2);
            } else {
                tsec = ($scope.newTask.time.substr(3, 1) === "0") ? $scope.newTask.time.substr(4, 1) :
                    $scope.newTask.time.substr(3, 2);
            }
            $scope.newTask.overall = (thour === "0" && tmin === "0") ? tsec + " сек." + " = " + number_format(total, {after: " коп.", thousands_sep: "", dec_point: " руб. "}) :
                (thour > "0") ? thour + " ч." + tmin + " мин." + tsec + " сек." + " = " + number_format(total, {after: " коп.", thousands_sep: "", dec_point: " руб. "}) :
                tmin + " мин." + tsec + " сек." + " = " + number_format(total, {after: " коп.", thousands_sep: "", dec_point: " руб. "});
            $scope.newTask = {
                name: null,
                cost: null,
                time: null,
                curr: " ₽ / час"
            };
            $scope.times.hours = "0";
            $scope.times.minutes = "00";
            $scope.times.seconds = "00";
            var data = $scope.tasks;
            localStorage.setItem("storage", JSON.stringify(data));
            var currTime = $scope.times;
            localStorage.setItem("timer", JSON.stringify(currTime));
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
            var tms;
            if($scope.activeTask.time.length >= 8) {
                tms = +$scope.activeTask.time.substr(0,2) * 3600 + +$scope.activeTask.time.substr(3,2) * 60 + +$scope.activeTask.time.substr(6,2);
            } if($scope.activeTask.time.length === 7) {
                tms = +$scope.activeTask.time.substr(0,1) * 3600 + +$scope.activeTask.time.substr(2,2) * 60 + +$scope.activeTask.time.substr(5,2);
            } else {
                tms = +$scope.activeTask.time.substr(0,2) * 60 + +$scope.activeTask.time.substr(3,2);
            }
            var total = $scope.activeTask.cost / 3600 * tms;
            var thour;
            if($scope.activeTask.time.length >= 9) {
                thour = $scope.activeTask.time.substr(0, 3);
            } if($scope.activeTask.time.length === 8) {
                thour = $scope.activeTask.time.substr(0, 2);
            } else {
                thour = $scope.activeTask.time.substr(0, 1);
            }
            var tmin;
            if($scope.activeTask.time.length >= 8) {
                tmin = ($scope.activeTask.time.substr(3, 1) === "0") ? $scope.activeTask.time.substr(4, 1) :
                    $scope.activeTask.time.substr(3, 2);
            } if($scope.activeTask.time.length === 7) {
                tmin = ($scope.activeTask.time.substr(2, 1) === "0") ? $scope.activeTask.time.substr(3, 1) :
                    $scope.activeTask.time.substr(2, 2);
            } else {
                tmin = ($scope.activeTask.time.substr(0, 1) === "0") ? $scope.activeTask.time.substr(1, 1) :
                    $scope.activeTask.time.substr(0, 2);
            }
            var tsec;
            if($scope.activeTask.time.length >= 8) {
                tsec = ($scope.activeTask.time.substr(6, 1) === "0") ? $scope.activeTask.time.substr(7, 1) :
                    $scope.newTask.time.substr(6, 2);
            } if($scope.activeTask.time.length === 7) {
                tsec = ($scope.activeTask.time.substr(5, 1) === "0") ? $scope.activeTask.time.substr(6, 1) :
                    $scope.activeTask.time.substr(5, 2);
            } else {
                tsec = ($scope.activeTask.time.substr(3, 1) === "0") ? $scope.activeTask.time.substr(4, 1) :
                    $scope.activeTask.time.substr(3, 2);
            }
            $scope.activeTask.overall = (thour === "0" && tmin === "0") ? tsec + " сек." + " = " + number_format(total, {after: " коп.", thousands_sep: "", dec_point: " руб. "}) :
                (thour > "0") ? thour + " ч." + tmin + " мин." + tsec + " сек." + " = " + number_format(total, {after: " коп.", thousands_sep: "", dec_point: " руб. "}) :
                tmin + " мин." + tsec + " сек." + " = " + number_format(total, {after: " коп.", thousands_sep: "", dec_point: " руб. "});
            $scope.activeTask = null;
            var data = $scope.tasks;
            localStorage.setItem("storage", JSON.stringify(data));
        };        
    });

