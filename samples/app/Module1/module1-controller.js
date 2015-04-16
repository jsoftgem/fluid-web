angular.module("module1", ["fluid"])
    .controller("module1Ctrl", ["$scope", function (s) {

        s.task.page.load = function (data) {
            s.data = data;
        }

    }]);