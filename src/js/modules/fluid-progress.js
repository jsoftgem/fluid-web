/**
 * Created by Jerico on 6/19/2015.
 */
angular.module("fluidProgress", [])
    .directive("fluidProgress", ["$templateCache", "fluidProgressService", "FluidProgress", "$timeout", function (tc, fps, FluidProgress, timeout) {
        return {
            require: "^fluidFrame",
            restrict: "E",
            scope: false,
            template: tc.get("templates/fluid/fluidProgress.html"),
            replace: true,
            transclude: true,
            link: function (scope, element, attr) {

                scope.runnerStack = [];

                if (attr.id) {
                    var id = element.attr("id");
                    element.attr("id", id + "_progress");
                    scope.progress = FluidProgress({id: id, element: element});
                } else {
                    throw "Id attribute is required.";
                }


                scope.$on(element.attr("id"), function () {
                    console.debug("fluid-progress-'have triggered':  ", element.attr("id"));
                    var progess = scope.progress;
                    angular.forEach(progess.runners, function (runner, $index) {
                        if (scope.runner) {
                            scope.runnerStack.push(runner);
                        } else {
                            scope.runner = runner;
                            console.debug("fluid-progress-'have triggered': - currentRunner ", runner);
                        }
                        progess.runners.splice($index, 1);
                    });
                });

                scope.startLoader = function () {
                    element.removeClass("fluid-progress");
                    element.addClass("fluid-progress-loading");
                }

                scope.endLoader = function () {
                    element.addClass("fluid-progress");
                    element.removeClass("fluid-progress-loading");
                }

                scope.$watch(function (scope) {
                    return scope.runner;
                }, function (newRunner, oldRunner) {
                    console.debug("fluid-progress.runner.new", newRunner);
                    function checkRunner() {

                        if (newRunner.done || newRunner.cancelled) {
                            if (scope.runnerStack) {
                                scope.runner = scope.runnerStack.shift();
                            }
                        } else {
                            if (!newRunner.inProgress) {
                                scope.startLoader();
                                newRunner.inProgress = true;
                                newRunner.load(function () {
                                        newRunner.done = true;
                                        newRunner.inProgress = false;
                                        scope.endLoader();
                                    }, function () {
                                        newRunner.cancelled = true;
                                        newRunner.inProgress = false;
                                        scope.endLoader();
                                    },
                                    function (message, type) {
                                        var messageElement = element.find(".status");
                                        var textClass = "info";
                                        if (type === "info") {
                                            textClass = "text-info";
                                        } else if (type === "danger") {
                                            textClass = "text-danger";
                                        } else if (type === "success") {
                                            textClass = "text-success";
                                        } else if (type === "warning") {
                                            textClass = "text-warning";
                                        }
                                        messageElement.addClass(textClass);
                                        messageElement.html(message);
                                    });
                            }
                            timeout(checkRunner, newRunner.sleep);
                        }

                    }

                    if (newRunner) {
                        checkRunner();
                    }


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
                        console.debug("progress-run.name", name);
                        var runner = {};
                        runner.name = name;
                        runner.load = loadFn;
                        runner.message = "Loading please wait...";
                        runner.sleep = 0;
                        if (progress.runners === undefined) {
                            progress.runners = [];
                        }
                        progress.runners.push(runner);
                        if (progress.element === undefined) {
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