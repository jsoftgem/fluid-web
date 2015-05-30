/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
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
        "fluidTasknav", "FluidTaskGroup", "FluidTaskItem", function (s, fhs, FrameService, fos, ms, rs, fts, ffh, FluidTasknav, FluidTaskGroup, FluidTaskItem) {
            s.menus = ["moduleBasic", "moduleTaskConfig"];
            s.fluidFrameHandler = ffh;

            s.openDrawer = function ($event) {
                console.info("openDrawer-fluidOption.id", $("div.fluid-option").attr("id"));
                fos.openOption($("div.fluid-option").attr("id"), "fullScreenNavMenu", $event.currentTarget);
            }
            s.tasknav = new FluidTasknav({
                name: "taskNav"
            });

            var taskGroup = new FluidTaskGroup({
                name: "Group1",
                title: "Getting Started"
            });

            var moduleBasicItem = new FluidTaskItem({
                name: "moduleBasic"
            });

            var moduleConfigItem = new FluidTaskItem({
                name: "moduleTaskConfig"
            });

            taskGroup.addTask(moduleBasicItem);
            taskGroup.addTask(moduleConfigItem);
            s.tasknav.addGroup(taskGroup);

            s.frame = new FrameService('appFrame');

        }]);
