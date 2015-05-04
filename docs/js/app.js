/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .config(["taskStateProvider", function (tsp) {

        tsp.setTasks([
            {
                name: "module_basic",
                url: "docs/module_basic/module_basic.json"
            }
            ,
            {
                name: "moduleTaskConfig",
                url: "docs/module_task_config/module_task_config.json"
            }
        ])
    }])
    .run(["fluidStateService", function (fss) {
        fss.loadTask();
    }])
    .controller("mainCtrl", ["$scope", "fluidHttpService", "fluidFrameService", "fluidOptionService", "fluidMessageService", "$rootScope", "fluidTasknavService", function (s, fhs, FrameSerivce, fos, ms, rs, fts) {

        s.toggleMenu = function () {
            fts.toggle("taskSideBarId");
        }
        s.openDrawer = function ($event) {
            console.info("openDrawer-fluidOption.id", $("div.fluid-option").attr("id"));
            fos.openOption($("div.fluid-option").attr("id"), "fullScreenNavMenu", $event.currentTarget);
        }

        var frame = new FrameSerivce("appFrame");


        frame.openTask("module_basic")

        frame.openTask("moduleTaskConfig");

        s.frame = frame;

    }]);
