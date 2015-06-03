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
    .directive("fluidFrame", ["$templateCache", "$window", "fluidFrameService", function (tc, window, FrameService) {
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
            template: tc.get("templates/fluid/fluidFrame.html")
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
                    var maxHeight = element.parent().css("max-height");
                    console.debug("fluidPanel.fullScreen.resize.maxHeight", maxHeight);
                    console.debug("fluidPanel.fullScreen.resize.innerHeight", element.parent().innerHeight());
                    autoFullscreen(element, maxHeight.replace("px", ""), element.parent().innerWidth());
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

