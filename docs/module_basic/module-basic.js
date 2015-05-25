/**
 * Created by jerico on 4/28/2015.
 */
angular.module("moduleBasic", ["fluid"])
    .controller("moduleBasicCtrl", ["$scope", "$timeout", "TaskControl", "ToolBarItem", function (s, t, TaskControl, ToolBarItem) {


        s.fluidPanel.whenLoaded(function (fluidPanel) {
            var sample = new TaskControl();
            sample.label = "Sample";
            sample.setId("sample");
            fluidPanel.addControl(sample);


            var toobar = new ToolBarItem();
            toobar.label = "sample";
            toobar.setId("sample");
            fluidPanel.addToolbarItem(toobar);
        });


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