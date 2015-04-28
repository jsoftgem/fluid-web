/**
 * Created by Jerico on 4/16/2015.
 */
angular.module("mainApp", ["fluid"])
    .controller("mainCtrl", ["$scope", "fluidHttpService", "fluidFrameService", "fluidOptionService", "fluidMessageService", "$rootScope", function (s, fhs, ffs, fos, ms, rs) {

        s.toggleMenu = function () {
            s.menu = !s.menu;
            if (s.menu) {
                $("body").addClass("toggle-offcanvas")
            } else {
                $("body").removeClass("toggle-offcanvas");
            }
        }

        s.frameService = ffs;

        s.openTask = function (url) {
            ffs.addTask(url);
        }

        s.openDrawer = function ($event) {
            console.info("openDrawer-fluidOption.id", $("div.fluid-option").attr("id"));
            fos.openOption($("div.fluid-option").attr("id"), "fullScreenNavMenu", $event.currentTarget);
        }

        /*adds module json config here using href*/
        ffs.addTask("docs/module_basic/module_basic.json");
        ffs.addTask("docs/module_task_config/module_task_config.json");


    }]);
