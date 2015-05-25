/**
 * Created by Jerico on 5/3/2015.
 */
angular.module("fluidTaskcontrols", ["fluidTask"])
    .directive("fluidTaskcontrols", ["$templateCache", "fluidControlService", function (tc, fcs) {
        return {
            restrict: "E",
            template: tc.get("templates/fluid/fluidTaskcontrols.html"),
            scope: false,
            link: function (scope, element, attr) {
                if (!scope.fluidPanel) {
                    throw "fluidPanel is required";
                }
            },
            replace: true
        }
    }])
    .factory("TaskControl", ["fluidControlService", function (fcs) {
        var control = function () {
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
            this.setId = function (id) {
                this.id = id;
            }

            this.getId = function ($index) {
                if (!this.id) {
                    this.id = "elem_" + $index;
                }
                return this.id + "_ctl_" + this.fluidPanel.id;
            }
        }
        return control;
    }])
    .service("fluidControlService", [function () {
        this.controls = [];
        this.clear = function (id) {
            this.controls[id] = undefined;
        }
        return this;
    }]);