/**
 * Created by jerico on 4/28/2015.
 */
angular.module("moduleBasic", [])
    .controller("moduleBasicCtrl", ["$scope", function (s) {

        s.closeOption = false;
        s.fluidPage.onLoad = function () {
            if (this.name === "page2") {
                this.onClose = function (q, $event) {
                    s.openOption("onClose", $event.currentTarget);
                    return q(function (resolve, reject) {
                        if (s.closeOption) {
                            resolve();
                        }
                    });
                }
            }

        }

        s.save = function (resources) {
            console.info("moduleBasic-moduleBasicCtrl.resources", resources);
            resources.$save();
        }


    }]);