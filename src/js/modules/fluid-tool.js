/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidTool", [])
    .directive("fluidTool", ["$rootScope", "$compile", "$templateCache", function (r, c, tc) {
        return {
            scope: {task: '=', controls: '=', pages: '=', fluid: "=", size: "@", fixed: '='},
            restrict: "E",
            replace: true,
            template: tc.get("templates/fluid/fluidToolbar.html"),
            link: function (scope, element, attr) {


                if (attr.size) {
                    if (attr.size === "small") {
                        scope.size = "btn-group-xs";
                    } else if (attr.size === "medium") {
                        scope.size = "btn-group-sm";
                    } else if (attr.size === "large") {
                        scope.size = "btn-group-md";
                    }
                } else {
                    scope.size = "btn-group-md";
                }


                scope.runEvent = function (control, $event) {
                    if (control.action) {
                        control.action($event);
                    } else {
                        var event = control.id + "_fp_" + scope.task.id;
                        r.$broadcast(event);
                    }

                };


                scope.goToEvent = function (name, param) {
                    scope.fluid.navTo(name);
                };

                scope.getClass = function (uiType) {
                    if (uiType.toLowerCase() === "info") {
                        return "btn-info";
                    } else if (uiType.toLowerCase() === "danger") {
                        return "btn-danger";
                    } else if (uiType.toLowerCase() === "warning") {
                        return "btn-warning";
                    } else if (uiType.toLowerCase() === "inverse") {
                        return "btn-inverse";
                    } else if (uiType.toLowerCase() === "success") {
                        return "btn-success";
                    } else if (uiType.toLowerCase() === "primary") {
                        return "btn-primary";
                    } else {
                        return "btn-default";
                    }
                }
            }
        }
    }])
    .directive("fluidTool2", ["$templateCache", function (tc) {
        return {
            restrict: "E",
            replace: true,
            template: tc.get("templates/fluid/fluidToolbar2.html")
        }
    }])
    .factory("ToolBarItem", ["fluidToolbarService", function (ts) {

        var toolBarItem = function (task) {

            this.glyph = "fa fa-question";
            this.class = "";
            this.uiClass = "btn btn-default";
            this.label = "";
            this.type = "buttom";
            this.action = function (task, $event) {
            }
            this.showText = false;
            this.disabled = function () {
                return false;
            }
            this.visible = function () {
                return true;
            }

            if (ts.toolbarItems[task.name] != null) {
                ts.toolbarItems[task.name].push(this);
            } else {
                ts.toolbarItems[task.name] = [];
                ts.toolbarItems[task.name].push(this);
            }
        }


        return toolBarItem;

    }])
    .service("fluidToolbarService", [function () {
        this.toolbarItems = [];
        this.clear = function (page) {
            this.toolbarItems[page] = undefined;
        }

    }]);