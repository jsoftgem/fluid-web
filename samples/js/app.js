/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .controller("mainCtrl", ["$scope", "fluidHttpService", "fluidFrameService", function (s, fhs, ffs) {
        s.module1Task = {};
        s.frameService = ffs;
        fhs.getLocal("app/Module1/module1.json")
            .success(function (module1) {
                ffs.pushTask(module1);
            });
    }]);