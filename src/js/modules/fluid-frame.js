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
                    console.info("fluidFrame-fluidFrame2$watch.frame", frame);
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

                w.bind("resize", function () {
                    autoSizeFrame(element, scope.offset, w.height());
                });

                autoSizeFrame(element, scope.offset, w.height());

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
            console.info("fluidFrame-fluidFrameHandler.frames", frames);
            t(check, 1000);
        }

        check();

        return this;
    }])
    .factory("fluidFrameService", ["Frame", "fluidTaskService", "FluidTask", function (Frame, taskService, FluidTask) {
        /*  this.isSearch = false;
         this.searchTask = "";
         this.taskUrl = "";
         this.fullScreen = false;
         this.openTask = function (name, workspace) {
         //TODO: workspace
         var task = new Task(name);
         if (task) {
         }
         }
         if (this.taskList === undefined) {
         this.taskList = [];
         }
         this.pushTask = function (task) {
         task.generic = true;
         this.taskList.push(task);
         };
         this.addTask = function (url, origin) {

         var genericTask = this.createGenericTask();

         genericTask.origin = origin;

         this.taskList.push(genericTask);

         genericTask.index = this.taskList.length - 1;

         genericTask.url = url;

         var index = this.taskList.length - 1;

         if (this.fullScreen) {
         this.toggleFluidscreen();
         }

         t(function () {
         $(".frame-content").scrollTo($("div.panel[task]:eq(" + index + ")"), 200);
         }, 300);
         };
         this.toggleSearch = function () {
         this.isSearch = !this.isSearch;
         if (this.isSearch === false) {
         this.searchTask = "";
         }
         };
         this.toggleFullscreen = function (task) {
         this.fullScreen = true;
         this.fullScreenTask = task;
         t(function () {
         $(".frame-content").scrollTop(0);
         });
         };
         this.toggleFluidscreen = function () {
         this.fullScreen = false;
         this.fullScreenTask = undefined;
         };
         this.getFullTask = function (task) {
         console.info("getFullTask", task);
         var fullScreenTask = undefined;

         if (task) {
         var fullScreenTask = this.createGenericTask();

         fullScreenTask.url = this.taskUrl + task.name;
         fullScreenTask.size = 100;
         }

         return fullScreenTask;
         };
         this.createGenericTask = function () {

         var genericTask = Task();

         genericTask.id = "gen_id_";

         var countGeneric = 0;

         angular.forEach(this.taskList, function (task) {
         if ((task.id + "").indexOf("gen_id_") > -1) {
         countGeneric++;
         }
         });

         genericTask.id = genericTask.id + "" + countGeneric;


         genericTask.size = 50;

         genericTask.active = true;

         genericTask.glyph = "fa fa-tasks";

         genericTask.title = "...";

         genericTask.generic = true;


         return genericTask;
         };
         this.getFrame = function () {
         return $("div.frame-content.frame-fullscreen");
         }
         this.buildTask = function (task) {

         /!* Task event *!/
         task.preLoad = function () {
         };
         task.load = function () {
         };
         task.postLoad = function () {
         }
         task.onWindowClosing = function (page) {
         return true;
         }
         task.onWindowHiding = function (page) {
         return true;
         }
         task.onWindowOpening = function () {
         return true;
         }
         task.onWindowOpened = function () {
         }
         task.onWindowPinned = function (page) {

         }
         task.onWindowActive = function (page) {
         }

         return task;
         }
         this.showActionBar = function () {
         this.actionBarClass = "animated slideInUp";
         this.actionBarShowing = true;
         };
         this.hideActionBar = function () {
         this.actionBarClass = "animated slideOutDown";
         this.actionBarShowing = false;
         };*/
        var frameService = function (name) {
            var frame = new Frame(name);
            frame.openTask = function (taskName, workspace) {
                if (workspace) {

                }
                taskService.findTaskByName(taskName)
                    .then(function (task) {
                        var index = frame.tasks.length;
                        console.info("fluidFrame-fluidFrameService.task", task);
                        task.fluidId = name + "_" + task.id + "_" + index;
                        var fluidTask = new FluidTask(task);
                        frame.tasks.push(fluidTask);
                    });
            }
            frame.removeTask = function (task, workspace) {
                console.info("fluidFrame-fluidFrameService.removeTask.task", task);
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

