/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid", "fluidFrame"])
    .config(["taskStateProvider", function (tsp) {

        tsp.setTasks([
            {
                name: "moduleBasic",
                url: "docs/module_basic/module_basic.json"
            },
            {
                name: "moduleTaskConfig",
                url: "docs/module_task_config/module_task_config.json"
            }
        ]);

    }])
    .controller("mainCtrl", ["$scope", "fluidHttpService", "fluidFrameService", "fluidOptionService", "fluidMessageService", "$rootScope", "fluidTasknavService", "fluidFrameHandler",
        function (s, fhs, FrameService, fos, ms, rs, fts, ffh) {
            s.fluidFrameHandler = ffh;
            s.toggleMenu = function () {
                fts.toggle("taskSideBarId");
            }
            s.openDrawer = function ($event) {
                console.info("openDrawer-fluidOption.id", $("div.fluid-option").attr("id"));
                fos.openOption($("div.fluid-option").attr("id"), "fullScreenNavMenu", $event.currentTarget);
            }

            s.frame = new FrameService('appFrame');

        }]);
