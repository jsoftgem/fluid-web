/**
 * Created by Jerico on 6/19/2015.
 */
angular.module("fluidProgress", [])
    .directive("fluidProgress", ["$templateCache", function (tc) {
        return {
            require: "^fluidFrame",
            restrict: "E",
            scope: false,
            template: tc.get("templates/fluid/fluidProgress.html"),
            replace: true,
            transclude: true,
            link: function (scope, elem, attr) {
                if (attr.id) {
                    var id = elem.attr("id");
                    elem.attr(id + "_progress");
                }

                if (attr.name) {
                    var name = elem.attr("name");
                    elem.attr(name + "_progress");
                }
            }
        }
    }])
    .factory("FluidProgress", [function () {

        var fluidProgress = function (param) {

            if (param.id) {
                this.id = param.id;
                this.$ = function () {
                    return $("#" + this.param.id+"_progress");
                }
            }


            return this;
        }

        return fluidProgress;
    }]);