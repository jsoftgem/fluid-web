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


                scope.$on(element.attr("id"), function () {
                    console.debug("fluid-progress-'have triggered':  " + element.attr("id"));
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
            var progress = {};
            if (param.id) {
                if (param.element) {
                    progress.element = param.element;
                }
                if (fps.getFluidProgress(param.id) != null) {
                    return fps.getFluidProgress(param.id);
                } else {
                    progress.id = param.id;
                    progress.run = function (name, loadFn, sleep) {
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
                        if (progress.runners === undefined) {
                            progress.runners = [];
                        }
                        progress.runners.push(runner);
                        if(progress.element === undefined){
                            progress.element = angular.element(progress.$());
                        }
                        console.debug("progress.element", progress.element);
                        progress.element.scope().$broadcast(progress.element.attr("id"));
                        console.debug("progress.triggered", progress.element.attr("id"));
                    }
                    progress.$ = function () {
                        return $("#" + progress.id + "_progress");
                    }
                    fps.addFluidProgress(progress);
                }


            } else {
                throw "param id is required";
            }

            return progress;
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