/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .controller("mainCtrl", ["$scope", "fluidHttpService", "fluidFrameService", function (s, fhs, ffs) {
        ffs.addTask("app/Module1/module1.json");
    }]);