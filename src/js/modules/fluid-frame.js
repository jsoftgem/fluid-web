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
angular.module("fluidFrame", ["fluidHttp", "fluidTask", "fluidSession", "fluidProgress"])
    .directive("fluidFrame", ["$templateCache", "$window", "fluidFrameService", "$viewport", "FluidProgress", "$compile", function (tc, window, FrameService, v, FluidProgress, c) {
        return {
            restrict: "E",
            replace: true,
            scope: {name: "@", fullScreen: "=", showWorkspace: "="},
            link: function (scope, element) {
                var _t_nf = "templates/fluid/fluidFrameNF.html";

                scope.renderFrame = function () {
                    console.debug("fluidFrame-renderFrame");

                }

                if (!scope.name) {
                    throw "'name' attribute is required.";
                } else {

                    scope._t = _t_nf;

                    element.html("<bootstrap-viewport></bootstrap-viewport> <div fluid-progress id='_id_mf_fp_" + scope.name + "'><ng-include src='_t'></ng-include></div>");

                    c(element.contents())(scope);

                    console.debug("fluidFrame-init");


                    scope.progress = new FluidProgress({
                        id: "_id_mf_fp_" + scope.name
                    });

                    console.debug("fluidFrame.progress", scope.progress);

                    scope.progress.run("loadFrame", function (ok, cancel, notify) {
                        scope.frame = new FrameService(scope.name);
                        ok(scope.frame);
                        console.debug("fluidFrame.created", scope.frame);
                    });

                    scope.progress.onComplete("loadFrame", function (frame) {
                        scope.renderFrame();
                    });

                }


                $(window).on("resize", function () {
                    console.debug("fluid-frame.viewport", v);
                    scope.setViewport();
                });
                scope.setViewport = function () {
                };
                scope.setViewport();


            },
            template: tc.get("templates/fluid/fluidFrame.html")
        }
    }])
    .directive("fluidFullscreenHeight", ["$window", "$timeout", function ($w, t) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                var w = angular.element($w);

                if (attr.offset) {
                    scope.offset = attr.offset;
                }

                w.bind("resize", function () {
                    if (scope.frame.fullScreen) {
                        var frameElement = scope.frame.$();
                        var maxHeight = frameElement.css("height");
                        if (maxHeight) {
                            autoFullscreen(frameElement.find(".fluid-panel"), maxHeight.replace("px", ""), frameElement.innerWidth());
                        }
                    }
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
    .factory("fluidFrameService", ["Frame", "fluidTaskService", "FluidTask", "FluidProgress", function (Frame, taskService, FluidTask, FluidProgress) {
        var frameService = function (name) {
            var frame = new Frame(name);

            frame.openTask = function (taskName, page, workspace, onLoad) {
                if (workspace) {

                }
                taskService.findTaskByName(taskName)
                    .then(function (task) {
                        var index = frame.tasks.length;
                        console.debug("fluidFrame-fluidFrameService.task", task);
                        task.fluidId = name + "_" + task.id + "_" + index;

                        var fluidTask = new FluidTask(task);
                        fluidTask.frame = frame.name;
                        fluidTask.index = index;
                        fluidTask.page = page;
                        if (onLoad) {
                            fluidTask.onLoad = onLoad;
                        }
                        fluidTask.ok = function () {
                        };
                        fluidTask.failed = function () {
                            frame.tasks.splice(index, 1);
                        };
                        frame.tasks.push(fluidTask);

                        if (frame.fullScreen) {
                            if (frame.task) {
                                frame.switchTo(fluidTask);
                            } else {
                                frame.toggleFullscreen(fluidTask);
                            }
                        }
                    });
            };

            frame.openTaskRaw = function (task, page, workspace, onLoad) {
                var index = frame.tasks.length;
                console.debug("fluidFrame-fluidFrameService.task", task);
                task.fluidId = name + "_" + task.id + "_" + index;

                var fluidTask = new FluidTask(task);
                fluidTask.frame = frame.name;
                fluidTask.index = index;
                fluidTask.page = page;
                if (onLoad) {
                    fluidTask.onLoad = onLoad;
                }
                fluidTask.ok = function () {
                };
                fluidTask.failed = function () {
                    frame.tasks.splice(index, 1);
                };
                frame.tasks.push(fluidTask);

                if (frame.fullScreen) {
                    if (frame.task) {
                        frame.switchTo(fluidTask);
                    } else {
                        frame.toggleFullscreen(fluidTask);
                    }
                }
            };

            frame.removeTask = function (task, workspace) {
                console.debug("fluidFrame-fluidFrameService.removeTask.task", task);
                angular.forEach(this.tasks, function (tsk, $index) {
                    if (tsk.fluidId === task.fluidId) {
                        this.tasks.splice($index, 1);
                    }
                }, this);
            }
            frame.getFluidTask = function (fluidId) {
                var filteredTask = {};
                angular.forEach(function (task, $index) {
                    if (task.fluidId === fluidId) {
                        this.task = task;
                    }
                }, filteredTask);

                return filteredTask.task;
            }

            frame.$ = function () {
                return $(".fluid-frame[name='" + frame.name + "']");
            }

            frame.progress = new FluidProgress({
                id: "_id_mf_fp_" + name
            });

            frame.toggleFullscreen = function (task) {
                frame.progress.run("toggleFullscreen_" + task.fluidId, function (ok, cancel, notify) {
                    frame.fullScreen = !frame.fullScreen;
                    console.debug("fluidFrameService-toggleFullscreen.fullScreen", frame.fullScreen);
                    if (frame.fullScreen) {
                        frame.task = task;
                    } else {
                        frame.task = undefined;
                    }
                    ok(frame.fullScreen);
                });
            };

            frame.switchTo = function (task) {
                frame.progress.run("switchTask_" + task.fluidId, function (ok, cancel, notify) {
                    console.debug("fluidFrameService-switchTask.task", task);
                    frame.task = task;
                    ok(task);
                });
            };

            frame.closeTask = function (task, workspace) {
                frame.progress.run("closeTask_" + task.fluidId, function (ok, cancel, notify) {
                    if (frame.fullScreen) {
                        frame.fullScreen = false;
                        frame.task = undefined;
                    }
                    frame.removeTask(task, workspace);
                    ok(task);
                });
            }
            frame.clearPanel = function (id) {
                if (this.fluidPanel) {
                    var fluidPanel = this.fluidPanel[id];
                    if (fluidPanel) {
                        fluidPanel.clear();
                    }
                    this.fluidPanel[id] = null;
                }

            }
            return frame;
        };
        return frameService;

    }])
    .provider("Frame", function () {
        this.$get = ["$timeout", "fluidFrameHandler", function (t, fh) {
            console.debug("fluidFrame.FrameProvider.fluidFrameHandler.frames-start", fh.frames);

            var frame = function Frame(name) {
                console.debug("fluidFrame.FrameProvider.name", name);
                if (name) {
                    var key = frameKey + name;
                    if (fh.frames[key] !== undefined) {

                        console.debug("fluidFrame.FrameProvider.fluidFrameHandler.frames-in-cache", fh.frames);
                        return fh.frames[key];
                    } else {
                        this.name = name;
                        this.fullScreen = false;
                        this.task = undefined;
                        this.tasks = [];
                        fh.frames[key] = this;

                        console.debug("fluidFrame.FrameProvider.fluidFrameHandler.frames-in", fh.frames);
                        return fh.frames[key];
                    }
                }
            };

            console.debug("fluidFrame.FrameProvider.fluidFrameHandler.frames-end", fh.frames);
            return frame;
        }];
    });

