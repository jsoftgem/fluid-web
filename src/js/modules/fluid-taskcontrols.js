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
                scope.fluidControlService = fcs;
            },
            replace: true
        }
    }])
    .factory("TaskControl", ["fluidControlService", function (fcs) {
        var control = function (fluidPanel, type) {

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
            if (fcs.controls[fluidPanel.id] != null) {
                fcs.controls[fluidPanel.id].push(this);
            } else {
                fcs.controls[fluidPanel.id] = [];
                fcs.controls[fluidPanel.id].push(this);
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