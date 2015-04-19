angular.module("module1", ["fluid"])
    .controller("module1Ctrl", ["$scope", function (s) {

        s.task.page.load = function (data) {
            s.data = data;
        }

        s.selectPerson = function (person) {
            s.task.selectedPerson = person;
            s.fluid.goTo("page2");
        }

        s.sample = "hello";
    }]);