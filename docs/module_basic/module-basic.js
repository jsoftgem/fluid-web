/**
 * Created by jerico on 4/28/2015.
 */
angular.module("moduleBasic", [])
    .controller("moduleBasicCtrl", ["$scope", "$timeout", function (s, t) {

        console.info("moduleBasic.fluidPage", s.fluidPage);
        s.fluidPage.onLoad = function () {

           this.onClose = function (ok, cancel, $event) {
                if ($event) {
                    this.option.warning().open("onClose", $event.currentTarget, this);
                }
                this.ok = ok;
                this.cancel = cancel;
            }

           /* this.onChange = function (proceed, cancel, $event) {
                this.option.danger().open("onChange", $event.currentTarget, this);
                this.proceed = proceed;
                this.cancel = cancel;
            }*/
        }
        s.save = function (resources) {
            console.info("moduleBasic-moduleBasicCtrl.resources", resources);
            resources.$save();
        }


    }]);