/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid", "fluid.webComponents"])
    .config(["taskStateProvider", function (tsp) {

        tsp.setTask({
            name: "pInventory",
            url: "modules/inventory.json"
        });

    }])
    .controller("mainCtrl", ["$scope", "fluidFrameService", "sessionService",
        function (s, FrameService, ss) {

            s.frame = new FrameService('appFrame');

            s.getReducedHeight = function () {
                var bottomHeight = $(".navbar-fixed-bottom").innerHeight();
                var topHeight = $(".navbar-fixed-top").innerHeight();
                return bottomHeight + topHeight;
            };


        }]);


