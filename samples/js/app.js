/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .controller("mainCtrl", ["$scope", "fluidHttpService", "fluidFrameService", function (s, fhs, ffs) {
        s.openTask = function (url) {
            ffs.addTask(url);
        }


    }]);