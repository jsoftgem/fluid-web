/**
 * Created by jerico on 4/28/2015.
 */
angular.module("moduleBasic", ["fluid"])
    .controller("moduleBasicCtrl", ["$scope", "$timeout", "TaskControl", "ToolBarItem", function (s, t, TaskControl, ToolBarItem) {


        s.fluidPanel.whenLoaded(function (fluidPanel) {
            var sample = new TaskControl();
            sample.label = "Sample";
            sample.setId("sample");
            sample.visible = function () {
                var breadcrumb = this.fluidPanel.fluidBreadcrumb;

                return breadcrumb.currentPage() === "page1";
            }
            fluidPanel.addControl(sample);


            var toobar = new ToolBarItem();
            toobar.label = "sample";
            toobar.setId("sample");
            toobar.visible = function () {
                var breadcrumb = this.fluidPanel.fluidBreadcrumb;
                return breadcrumb.currentPage() === "page1";
            }
            fluidPanel.addToolbarItem(toobar);
        });


        console.debug("moduleBasic.fluidPage", s.fluidPage);


        s.fluidPage.onLoad = function () {
            this.option.putTemplate("onClose", "Do you want to close page {{fluidPage.title}} ? <a href='#' ng-click='fluidPage.ok()'>Yes</a> {{' '}} <a href='#' ng-click='fluidPage.cancel()'>No</a>");
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
            console.debug("moduleBasic-moduleBasicCtrl.resources", resources);
            resources.$save();
        }


    }]);