/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .controller("mainCtrl", ["$scope", "fluidHttpService", "fluidFrameService", function (s, fhs, ffs) {
        s.module1Task = {};
        fhs.getLocal("app/Module1/module1.json")
            .success(function (module1) {
                s.module1Task = module1;
                ffs.pushTask(s.module1Task);
            });
    }]);