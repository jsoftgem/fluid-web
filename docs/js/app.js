/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .config(["taskStateProvider", function (tsp) {

        tsp.setTasks([
            {
                name: "moduleTask",
                url: "docs/module_task/module-task.json"
            },
            {
                name: "moduleBasic",
                url: "docs/module_basic/module-basic.json"
            }
        ]);

    }])
    .controller("mainCtrl", ["$scope", "fluidFrameService",
        function (s, FrameService) {
            s.frame = new FrameService('appFrame');
            s.frame.openTask("moduleTask");
        }]);


