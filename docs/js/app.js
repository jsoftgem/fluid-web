/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .config(["taskStateProvider", function (tsp) {


        tsp.setTask({
            name: "moduleBasic",
            url: "docs/module_basic/module-basic.json"
        });


    }])
    .controller("mainCtrl", ["$scope", "fluidFrameService", "sessionService",
        function (s, FrameService, ss) {

            s.frame = new FrameService('appFrame');

            s.frame.fullScreen = true;

            s.frame.openTask("moduleBasic");

            s.getReducedHeight = function () {
                var bottomHeight = $(".navbar-fixed-bottom").innerHeight();
                var topHeight = $(".navbar-fixed-top").innerHeight();
                return bottomHeight + topHeight;
            };


        }]);


