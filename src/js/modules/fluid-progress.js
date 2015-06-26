/**
 * Created by Jerico on 6/19/2015.
 */
angular.module("fluidProgress", [])
    .directive("fluidProgress", ["$templateCache", "fluidProgressService", "FluidProgress", "$timeout", "$q", function (tc, fps, FluidProgress, timeout, q) {
        return {
            restrict: "AE",
            scope: false,
            template: tc.get("templates/fluid/fluidProgress.html"),
            replace: true,
            transclude: true,
            link: function (scope, element, attr) {

                scope.runnerStack = [];
                scope.asynchronous = false;
                scope.max = 0;
                scope.min = 0;
                scope.count = 0;
                if (attr.asynchronous) {
                    scope.asynchronous = attr.asynchronous === "true";
                }

                if (attr.id) {
                    var id = element.attr("id");
                    element.attr("id", id + "_progress");
                    scope.progress = FluidProgress({id: id, element: element});
                } else {
                    throw "Id attribute is required.";
                }


                scope.$on(element.attr("id"), function () {
                    console.debug("fluid-progress-'have triggered':  ", element.attr("id"));
                    var progress = scope.progress;
                    angular.forEach(progress.runners, function (runner, $index) {
                        progress.inProgress = true;
                        var progressBar = element.find(".progress-bar");

                        if (progressBar) {
                            if (runner.max) {
                                if (scope.max === 0) {
                                    progress.max = 0;
                                }
                                progress.max += runner.max;
                                scope.max += runner.max;
                            }

                            if (runner.min) {
                                if (scope.min === 0) {
                                    progress.min = scope.min;
                                }
                                progress.min += runner.min;
                                scope.min += runner.min;
                            }

                            if (scope.count === 0) {
                                progress.count = scope.count;
                            }

                        }

                        if (scope.runner && !scope.asynchronous) {
                            scope.runnerStack.push(runner);
                        } else if (scope.asynchronous) {
                            var defer = q.defer();
                            timeout(function () {
                                loadRunner(scope, element, runner, progress);
                                defer.resolve(runner);
                            }, runner.sleep);

                        } else {
                            scope.runner = runner;
                            console.debug("fluid-progress-'have triggered': - currentRunner ", runner);
                        }
                        progress.runners.splice($index, 1);
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
                                newRunner.inProgress = true;
                                loadRunner(scope, element, newRunner, scope.progress);
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
                /*if (param.element) {
                 progress.element = param.element;
                 }*/
                if (fps.getFluidProgress(param.id) != null) {
                    return fps.getFluidProgress(param.id);
                } else {
                    progress.max = 0;
                    progress.min = 0;
                    progress.count = 0;
                    progress.id = param.id;
                    progress.run = function (name, loadFn, options) {
                        console.debug("progress-run.name", name);
                        var runner = {};
                        if (options) {
                            runner.max = options.max;
                            runner.min = options.min;
                            runner.sleep = options.sleep;
                        }
                        runner.name = name;
                        runner.load = loadFn;
                        runner.message = "Loading please wait...";
                        if (progress.runners === undefined) {
                            progress.runners = [];
                        }
                        progress.runners.push(runner);
                        progress.element = angular.element(progress.$());

                        console.debug("progress.element", progress.element);
                        progress.element.scope().$broadcast(progress.element.attr("id"));
                        console.debug("progress.triggered", progress.element.attr("id"));
                    }
                    progress.$ = function () {
                        return $("#" + progress.id + "_progress");
                    }
                    progress.onComplete = function (name, completeFunc) {
                        if (this.completeFuncs === undefined) {
                            this.completeFuncs = [];
                        }
                        this.completeFuncs[name] = completeFunc;
                        console.debug("progress.completeFuncs", this.completeFuncs);
                    }
                    progress.onCancelled = function (name, cancelledFunc) {
                        if (this.cancelledFuncs === undefined) {
                            this.cancelledFuncs = [];
                        }
                        this.cancelledFuncs[name] = completeFunc;
                        console.debug("progress.cancelledFuncs", this.cancelledFuncs);

                    }

                    progress.cancel = function (name, reason) {
                        if (this.cancelledFuncs) {
                            var cancelFunc = this.cancelledFuncs[name];
                            if (cancelFunc) {
                                cancelFunc(reason);
                            }
                        }
                    }

                    progress.complete = function (name, resolver) {
                        if (this.completeFuncs) {
                            var completeFunc = this.completeFuncs[name];
                            if (completeFunc) {
                                completeFunc(resolver);
                            }
                        }

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