/**
 * Created by jerico on 4/28/2015.
 */
angular.module("moduleBasic", [])
    .controller("moduleBasicCtrl", ["$scope", function (s) {


        s.save = function(resources){
            console.info("moduleBasic-moduleBasicCtrl.resources",resources);
            resources.$save();
        }
    }]);