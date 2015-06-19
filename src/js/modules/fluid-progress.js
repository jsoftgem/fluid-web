/**
 * Created by Jerico on 6/19/2015.
 */
angular.module("fluidProgress", [])
    .directive("fluidProgress", ["$templateCache", "fluidProgressService", "FluidProgress", function (tc, fps, FluidProgress) {
        return {
            require: "^fluidFrame",
            restrict: "E",
            scope: false,
            template: tc.get("templates/fluid/fluidProgress.html"),
            replace: true,
            transclude: true,
            link: function (scope, elem, attr) {

                scope.runners = [];

                if (attr.id) {
                    var id = elem.attr("id");
                    elem.attr("id", id + "_progress");
                    var elemId = elem.attr("id");
                    scope.progres = FluidProgress({id: elemId});
                } else {
                    throw "Id attribute is required.";
                }


                element.on(element.attr("id"), function () {
                    var progess = element.scope().progress;

                });


            }
        }
    }])
    .factory("FluidProgress", ["fluidProgressService", function (fps) {

        var fluidProgress = function (param) {

            if (param.id) {

                if (fps.getFluidProgress(param.id) != null) {
                    return fps.getFluidProgress(param.id);
                } else {
                    this.id = param.id;
                    this.run = function (name, loadFn, sleep) {
                        var runner = {};
                        runner.name = name;
                        runner.load = loadFn;
                        runner.message = "Loading please wait...";
                        runner.cancel = function () {
                            this.cancelled = true;
                        }
                        runner.ok = function () {
                            this.done = true;
                        }
                        runner.sleep = 0;
                        if (this.runners === undefined) {
                            this.runners = [];
                        }
                        this.runners.push(runner);
                        var element = angular.element(this.$());
                        element.triggerHandler(element.attr("id"));
                    }
                    this.$ = function () {
                        return $("#" + this.param.id + "_progress");
                    }
                    fps.addFluidProgress(this);
                }
            } else {
                throw "param id is required";
            }


            return this;
        }

        return fluidProgress;
    }])
    .service("fluidProgressService", [function () {
        this.progressObjects = [];

        this.addFluidProgress = function (progress) {
            this.progressObjects[progres.id + "_progress"] = progress;
        }
        this.getFluidProgress = function (id) {
            this.progressObjects[id + "_progress"];
        }

        this.clearProgress = function (id) {
            this.progressObjects[id] = undefined;
        }
    }]);