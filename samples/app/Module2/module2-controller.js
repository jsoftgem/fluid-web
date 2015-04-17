angular.module("module2", ["fluid"])
    .controller("module2Ctrl", ["$scope", function (s) {

        s.task.page.load = function (data) {
            s.data = data;
        }

        s.selectBook = function (book) {
            s.task.selectedBook = book;
            s.fluid.goTo("page2");
        }

    }]);