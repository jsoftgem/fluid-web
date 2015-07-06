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
        function (s, fhs, FrameService, fos, ms, rs, fts, ffh) {
            s.menus = ["moduleBasic", "moduleTaskConfig"];

            s.frame = new FrameService('appFrame');

            s.frame.openTask("moduleTaskConfig", undefined, undefined, function (ok, failed) {
            });
            s.frame.openTask("moduleBasic", undefined, undefined, function (ok, failed) {
            });

        }]);


