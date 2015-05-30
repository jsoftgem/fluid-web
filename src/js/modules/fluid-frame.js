/**
 * Created by jerico on 4/28/2015.
 * Fluid Frame Version 2.0 ff features:
 *
 * ** TODO: State Manager
 *
 * ** Detachable Frames
 *
 * ** Different Workspace
 *
 * ** Detachable Task
 *
 * ** Split Screen
 */

var frameKey = "frame_";
angular.module("fluidFrame", ["fluidHttp", "fluidTask", "fluidSession"])
    .directive("fluidFrame2", ["$templateCache", "$window", "fluidFrameService", function (tc, window, FrameService) {
        return {
            restrict: "E",
            replace: true,
            scope: {name: "@", fullScreen: "=", showWorkspace: "="},
            controller: ["$scope", function (s) {
                if (!s.name) {
                    throw "'name' attribute is required.";
                } else {
                    s.frame = new FrameService(s.name);
                }

                s.$watch(function (scope) {
                    return scope.frame;
                }, function (frame) {
                    console.debug("fluidFrame-fluidFrame2$watch.frame", frame);
                })
            }],
            template: tc.get("templates/fluid/fluidFrame2.html")
        }
    }])
    .directive("fluidFrame", ["fluidFrameService", "$window", "$rootScope", "$timeout", "$templateCache", function (f, w, rs, t, tc) {
        return {
            restrict: "AE",
            transclude: true,
            scope: true,
            template: tc.get("templates/fluid/fluidFrame.html"),
            replace: true,
            controller: function ($scope) {

            },
            link: function (scope, element) {

                scope.frame = {};
                scope.fluidFrameService = f;
                scope.$watch(function (scope) {
                    return scope.fluidFrameService.fullScreen;
                }, function (fullScreen) {

                    var frameDiv = $(element.find("div.form-group")[1]);

                    if (!fullScreen) {
                        var height = window.innerHeight;
                        height = estimatedFrameHeight(height);
                        var frameHeight = height;
                        if (scope.fluidFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + frameHeight + "px;overflow:auto");
                        } else {
                            element.attr("style", "height:" + frameHeight + "px;overflow:auto");
                        }
                        $("body").attr("style", "height: " + window.innerHeight + "px;overflow:hidden");
                    } else {
                        var height = window.innerHeight;
                        height = estimatedFrameHeight(height);
                        var frameHeight = height;
                        if (scope.fluidFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                        } else {
                            element.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                        }
                        $("body").attr("style", "height: " + window.innerHeight + "px;overflow:hidden");
                    }
                });


                scope.show = function (task) {
                    if (!task.pinned) {
                        task.active = !task.active;
                    }
                };

                $(window).on("resize", function () {
                    if (scope) {
                        if (!scope.fluidFrameService.fullScreen) {
                            var height = window.innerHeight;
                            height = estimatedFrameHeight(height);
                            var frameHeight = height;
                            if (scope.fluidFrameService.isSearch) {
                                frameDiv.attr("style", "height:" + frameHeight + "px;overflow:auto");
                            } else {
                                element.attr("style", "height:" + frameHeight + "px;overflow:auto");
                            }
                        } else {
                            var height = window.innerHeight;
                            height = estimatedFrameHeight(height);
                            if (scope.fluidFrameService.isSearch) {
                                frameDiv.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                            } else {
                                element.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                            }
                        }

                        $("body").attr("style", "height: " + window.innerHeight + "px;overflow:hidden");
                    }
                });


                scope.initTask = function (task) {
                    if (task) {
                        scope.$watch(function () {
                            return task.active;
                        }, function (newValue, oldValue) {
                            if (true === newValue) {
                                if (task.onWindowOpening) {
                                    task.onWindowOpened();
                                } else {
                                    task.active = false;
                                }
                            }

                        });
                    }
                }
            }
        };
    }])
    .directive("fluidResizeFrame", ["$window", function ($w) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {

                var w = angular.element($w);

                if (attr.offset) {
                    scope.offset = attr.offset;
                }

                if (attr.reduceHeight) {
                    scope.reduceHeight = attr.reduceHeight;
                }

                w.bind("resize", function () {
                    autoSizeFrame(element, scope.offset, w.height(), scope.reduceHeight);
                });

                autoSizeFrame(element, scope.offset, w.height(), scope.reduceHeight);

            }
        }
    }])
    .directive("fluidFullscreenHeight", ["$window", function ($w) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {

                var w = angular.element($w);

                if (attr.offset) {
                    scope.offset = attr.offset;
                }

                w.bind("resize", function () {
                    autoFullscreen(element, element.parent().height(), element.parent().width());
                });
            }
        }
    }])
    .service("fluidFrameHandler", ["$timeout", function (t) {
        this.frames = [];

        var frames = this.frames;

        function check() {
            console.debug("fluidFrame-fluidFrameHandler.frames", frames);
            t(check, 1000);
        }

        return this;
    }])
    .factory("fluidFrameService", ["Frame", "fluidTaskService", "FluidTask", function (Frame, taskService, FluidTask) {
        var frameService = function (name) {
            var frame = new Frame(name);
            frame.openTask = function (taskName, page, workspace) {
                if (workspace) {

                }
                taskService.findTaskByName(taskName)
                    .then(function (task) {
                        var index = frame.tasks.length;
                        console.debug("fluidFrame-fluidFrameService.task", task);
                        task.fluidId = name + "_" + task.id + "_" + index;

                        var fluidTask = new FluidTask(task);
                        fluidTask.frame = frame.name;
                        fluidTask.page = page;
                        frame.tasks.push(fluidTask);
                    });
            }
            frame.removeTask = function (task, workspace) {
                console.debug("fluidFrame-fluidFrameService.removeTask.task", task);
                angular.forEach(this.tasks, function (tsk, $index) {
                    if (tsk.fluidId === task.fluidId) {
                        this.tasks.splice($index, 1);
                    }
                }, this);
            }
            return frame;
        }
        return frameService;

    }])
    .provider("Frame", function () {
        this.$get = ["$timeout", "fluidFrameHandler", "fluidStateService", function (t, fh, fts) {
            var frame = function Frame(name) {
                if (name) {
                    var key = frameKey + name;
                    if (fh.frames[key] != null) {
                        return fh.frames[key];
                    } else {
                        this.name = name;
                        this.fullScreen = false;
                        this.task = undefined;
                        this.tasks = [];
                        // this.workspaces = [];
                        //this.showWorkspace = false;
                        fh.frames[key] = this;
                    }
                }
            };
            return frame;
        }];
    });

