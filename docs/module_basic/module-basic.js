/**
 * Created by jerico on 4/28/2015.
 */
angular.module("moduleBasic", ["fluid"])
    .controller("moduleBasicCtrl", ["$scope", "$timeout", "TaskControl", "ToolBarItem", function (s, t, TaskControl, ToolBarItem) {


        var sample = new TaskControl();
        sample.label = "Sample";
        sample.setId("sample");
        sample.visible = function () {
            var breadcrumb = s.fluidPanel.fluidBreadcrumb;

            return breadcrumb.currentPage() === "page1";
        }
        s.fluidPanel.addControl(sample);


        var toolbar = new ToolBarItem();
        toolbar.label = "sample";
        toolbar.setId("sample");
        toolbar.visible = function () {
            var breadcrumb = s.fluidPanel.fluidBreadcrumb;
            return breadcrumb.currentPage() === "page1";
        };
        s.fluidPanel.addToolbarItem(toolbar);

        console.debug("moduleBasic.fluidPage", s.fluidPage);


        s.fluidPage.onLoad = function (ok) {
            this.option.putTemplate("onClose", "Do you want to close page {{fluidPage.title}} ? <a href='#' ng-click='fluidPage.ok()'>Yes</a> {{' '}} <a href='#' ng-click='fluidPage.cancel()'>No</a>");

            if (this.name === "page5") {
                this.onClose = function (ok, cancel, $event) {
                    this.option.warning().open("onClose", $event.currentTarget, this);
                    this.ok = ok;
                    this.cancel = cancel;
                }
            }


            this.onViewportChange = function (viewport) {
                console.debug("module-basic.viewport", viewport);
            }

            this.onSizeChange = function (size) {
                console.debug("module-basic.size", size);
            }

            /* this.onChange = function (proceed, cancel, $event) {
             this.option.danger().open("onChange", $event.currentTarget, this);
             this.proceed = proceed;
             this.cancel = cancel;
             }*/
            return ok();
        }

        s.save = function (resources) {
            console.debug("moduleBasic-moduleBasicCtrl.resources", resources);
            resources.$save();
        }


    }]);