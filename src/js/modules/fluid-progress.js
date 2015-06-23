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
            link: function (scope, element, attr) {

                scope.runnerStack = [];
                scope.runner = {};

                if (attr.id) {
                    var id = element.attr("id");
                    element.attr("id", id + "_progress");
                    scope.progress = FluidProgress({id: id, element: element});
                } else {
                    throw "Id attribute is required.";
                }


                element.on(element.attr("id"), function () {
                    var currentScope = element.scope();
                    var progess = element.scope().progress;
                    angular.forEach(progess.runners, function (runner, $index) {
                        var currentRunner = currentScope.runner;

                        if ((currentRunner.done === undefined || currentRunner.done) || (currentRunner.cancelled === undefined || currentRunner.cancelled)) {
                            currentScope.runnerStack.push(runner);
                        } else {
                            currentScope.runner = runner;
                        }
                        progess.runners.splice($index, 1);
                    });
                });


                scope.$watch(function (scope) {
                    return scope.runner;
                }, function (newRunner, oldRunner) {
                    console.debug("fluidProgress.runner.new", newRunner);
                });

            }
        }
    }])
    .factory("FluidProgress", ["fluidProgressService", function (fps) {

        var fluidProgress = function (param) {
            console.debug("fluidProgress-FluidProgress.param", param);
            if (param.id) {
                if (fps.getFluidProgress(param.id) != null) {
                    return fps.getFluidProgress(param.id);
                } else {
                    if (param.element) {
                        this.element = param.element;
                    }
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
                        console.debug("progress.element", this.element);
                        this.element.triggerHandler(this.element.attr("id"));
                        console.debug("progress.triggered", this.element.attr("id"));
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

        this.addFluidProgress = function (progress) {
            var id = progress.id + "_progress";
            if (this.progressObjects == null) {
                this.progressObjects = [];
            }
            this.progressObjects[id] = progress;
            console.debug("fluid-progress-fluidProgressService-addFluidProgress.progressObjects", this.progressObjects);
            console.debug("fluid-progress-fluidProgressService-addFluidProgress.id", id);
        }

        this.getFluidProgress = function (id) {
            if (this.progressObjects) {
                console.debug("fluid-progress-fluidProgressService-getFluidProgress.id", id);
                console.debug("fluid-progress-fluidProgressService-getFluidProgress.progressObjects", this.progressObjects);
                var key = id + "_progress";
                var progressObject = this.progressObjects[key];
                console.debug("fluid-progress-fluidProgressService-getFluidProgress.progressObject", progressObject);
                return progressObject;
            }
        }

        this.clearProgress = function (id) {
            this.progressObjects[id] = undefined;
        }


        return this;
    }]);