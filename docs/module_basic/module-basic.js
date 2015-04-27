/**
 * Created by jerico on 4/28/2015.
 */
angular.module("moduleBasic", [])
    .controller("moduleBasicCtrl", ["$scope", function (s) {
        s.header = "Scope was initialized!";
    }]);