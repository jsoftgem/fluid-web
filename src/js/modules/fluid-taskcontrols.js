/**
 * Created by Jerico on 5/3/2015.
 */
angular.module("fluidTaskcontrols", ["fluidTask"])
    .directive("fluidTaskcontrols", ["$templateCache", "fluidTaskService", function (tc) {
        return {
            restrict: "E",
            template: tc.get("templates/fluid/fluidTaskcontrols.html"),
            scope: false,
            link: function (scope, element, attr) {
                if (scope.task) {
                    console.info("fluidTaskcontrols-fluidTaskcontrols.task", scope.task);
                } else {
                    throw  "Task is required."
                }
            },
            replace: true
        }
    }])
    .factory("TaskControl", ["fluidControlService", function (fcs) {
        var control = function (task, type) {

            this.glyph = "fa fa-question";
            this.uiClass = "btn btn-default";
            this.class = "";
            this.label = "";
            this.action = function (task, $event) {
            }

            this.disabled = function () {
                return false;
            }

            this.visible = function () {
                return true;
            }
            if (fcs.controls[task.name] != null) {
                fcs.controls[task.name].push(this);
            } else {
                fcs.controls[task.name] = [];
                fcs.controls[task.name].push(this);
            }

        }
        return control;
    }])
    .service("fluidControlService", [function () {
        this.controls = [];
        this.clear = function (name) {
            this.controls[name] = undefined;
        }
        return this;
    }]);