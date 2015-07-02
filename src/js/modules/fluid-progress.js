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
                    scope.progress = FluidProgress({id: id});
                } else {
                    throw "Id attribute is required.";
                }
                scope.$on(element.attr("id"), function () {
                    console.debug("fluid-progress-'have triggered':  ", element.attr("id"));
                    var progress = scope.progress;
                    angular.forEach(progress.runners, function (runner, $index) {
                        progress.inProgress = true;
                        if (runner.triggered) {
                            runner.triggered = false;
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
                        }

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
                scope.$on("$destroy", function () {
                    if (scope.progress) {
                        scope.progress.completeFuncs = [];
                        scope.progress.cancelledFuncs = [];
                        fps.clearProgress(scope.progress.id);
                    }
                });
            }
        }
    }])
    .factory("FluidProgress", ["fluidProgressService", "$timeout", function (fps, t) {

        var fluidProgress = function (param) {
            console.debug("fluidProgress-FluidProgress.param", param);
            var progress = {};
            if (param.id) {
                if (fps.getFluidProgress(param.id) !== undefined) {
                    progress = fps.getFluidProgress(param.id);
                } else {
                    progress.completeFuncs = [];
                    progress.cancelledFuncs = [];
                    progress.max = 0;
                    progress.min = 0;
                    progress.count = 0;
                    progress.id = param.id;
                    progress.run = function (name, loadFn, options) {
                        var exists = false;
                        console.debug("progress-run.name", name);
                        if (progress.runners) {
                            console.debug("progress-run.runners", progress.runners);
                            for (var i = 0; i < progress.runners.length; i++) {
                                var runner = progress.runners[i];
                                if (runner.name === name) {
                                    exists = true;
                                    runner.done = false;
                                    runner.cancelled = false;
                                    runner.inProgress = false;
                                    runner.triggered = true;
                                    if(loadFn){
                                        runner.load = loadFn;
                                    }
                                    if (options) {
                                        runner.max = options.max ? options.max : runner.max;
                                        runner.min = options.min ? options.min : runner.min;
                                        runner.sleep = options.sleep ? options.sleep : runner.sleep;
                                    }
                                    console.debug("progress-run.saved-triggered.runner", runner);
                                    console.debug("progress-run.saved-triggered.name", name);
                                }
                            }
                        }

                        if (!exists) {
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
                            runner.triggered = true;
                            progress.runners.push(runner);
                        }

                        progress.element = angular.element(progress.$());
                        console.debug("progress.element", progress.element);

                        var scope = progress.element.scope();
                        if (scope) {
                            progress.element.scope().$broadcast(progress.element.attr("id"));
                            console.debug("progress.triggered", progress.element.attr("id"));
                        }


                    }
                    progress.$ = function () {
                        return $("#" + progress.id + "_progress");
                    }
                    progress.onComplete = function (name, completeFunc) {
                        if (this.completeFuncs[name] == null) {
                            this.completeFuncs[name] = [];
                        }
                        this.completeFuncs[name].push(completeFunc);
                        console.debug("progress.completeFunc-name", name);
                        console.debug("progress.completeFunc", completeFunc);
                        console.debug("progress.completeFuncs", this.completeFuncs);
                    }
                    progress.onCancelled = function (name, cancelledFunc) {
                        if (this.cancelledFuncs[name] == null) {
                            this.cancelledFuncs[name] = [];
                        }
                        this.cancelledFuncs[name].push(completeFunc);
                        console.debug("progress.cancelledFuncs", this.cancelledFuncs);
                    }
                    progress.cancel = function (name, reason) {
                        if (this.cancelledFuncs) {
                            var cancelFuncs = this.cancelledFuncs[name];
                            if (cancelFuncs) {
                                angular.forEach(cancelFuncs, function (func, $index) {
                                    t(function () {
                                        if (func) {
                                            func(reason);
                                        }
                                    });
                                });
                            }
                        }
                    }
                    progress.complete = function (name, resolver) {
                        if (this.completeFuncs) {
                            var completeFuncs = this.completeFuncs[name];
                            console.debug("fluid-progress.complete.name", name);
                            console.debug("fluid-progress.complete.completeFuncs", completeFuncs);
                            if (completeFuncs) {
                                console.debug("fluid-progress.complete.length", completeFuncs.length);
                                angular.forEach(completeFuncs, function (func, $index) {
                                    console.debug("fluid-progress.complete.$index", $index)
                                    t(function () {
                                        if (func) {
                                            func(resolver);
                                        }
                                    });
                                });
                            }

                        }

                    }
                    progress.clear = function () {
                        progress.completeFuncs = [];
                        progress.cancelledFuncs = [];
                        progress.runners = [];
                    }
                    fps.addFluidProgress(progress);

                }


            } else {
                throw "param id is required";
            }

            console.debug("fluid-progress.progress", progress);
            return progress;
        }
        return fluidProgress;
    }])
    .service("fluidProgressService", ["$timeout", function (t) {

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
            this.progressObjects[id + "_progress"] = undefined;
        }

        return this;
    }]);