/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .controller("mainCtrl", ["$scope", "flowHttpService", function (s, fhs) {

        s.module1Task = {};

        console.info("fhs", fhs);

        fhs.getLocal("example/app/Module1/module1.json")
            .success(function (module1) {
                s.module1Task = module;
            })


    }]);