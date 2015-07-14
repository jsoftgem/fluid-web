/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidTool", [])
    .directive("fluidTool", ["$templateCache", function (tc) {
        return {
            restrict: "E",
            replace: true,
            scope: false,
            template: tc.get("templates/fluid/fluidToolbar.html"),
            link: {
                post: function (scope, element, attr) {
                }
            }

        }
    }])
    .factory("ToolBarItem", [function () {

        var toolBarItem = function () {
            this.glyph = "fa fa-question";
            this.class = "";
            this.uiClass = "btn btn-default";
            this.label = "";
            this.type = "buttom";
            this.action = function (task, $event) {
            };
            this.showText = false;
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
                return this.id + "_btn_tl_" + this.fluidPanel.id;
            }
        }

        return toolBarItem;

    }])
    .service("fluidToolbarService", [function () {
        this.toolbarItems = [];
        this.clear = function (id) {
            this.toolbarItems[id] = undefined;
        }

    }]);