/**
 * Created by jerico on 4/30/2015.
 */
'use strict';

angular.module("fluidTaskTest", ["fluidTask"])
    .config(["taskStateProvider", function (ftp) {
        ftp.setAjax(true);
        ftp.setUrl("/test/resources/task");

    }])
    .run(["fluidStateService", "$httpBackend", function (fss, hb) {
        hb.when("GET", "/module_base.json").respond({
            id: "task1",
            name: "basicTask",
            title: "Task 1",
            size: 100,
            glyph: "fa fa-gears",
            active: true,
            closeable: true,
            pages: [
                {
                    id: "page1",
                    name: "page1",
                    title: "Page 1",
                    static: true,
                    isHome: true,
                    html: "<h1>Sample Page 1</h1>"
                }
            ]
        });
        hb.when("GET", "/test/resources/tasks").respond(
            [
                {name: "basicTask", url: "/module_base.json"}
            ]
        );

        fss.loadTask();
    }])
    .controller("fluidTaskCtrl", ["$scope", "Task", function (s, Task) {

        s.getBasicTask = function () {
            var task = new Task({name: "basicTask"});
            console.log(task);
            return task;
        }

    }]);

describe("Testing task provider", function () {

    var $controller,$scope={};

    beforeEach(module("fluidTaskTest"));

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));

    it("gets the cached basic task", function () {
        var fluidTaskCtrl = $controller("fluidTaskCtrl",
            {$scope: $scope});


        var task = fluidTaskCtrl.getBasicTask();
        console.log(task);

    });


});