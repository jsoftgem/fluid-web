/**
 * Created by Jerico on 4/29/2015.
 */
var taskKey = "$task_";
var timeout = 30;//sets 30 seconds timeout.

angular.module("fluidTask", ["fluidSession", "fluidFrame"])
    .directive("fluidTask", ["FluidTask", "fluidTaskService", "$compile", "fluidFrameService",
        "$templateCache", function (FluidTask, fluidTaskService, compile, FluidFrame, tc) {
            return {
                restrict: "AE",
                transclude: true,
                replace: true,
                template: "<span><ng-transclude></ng-transclude></span>",
                scope: {name: "@", url: "@", template: "@", frame: "@"},
                link: {
                    pre: function (scope, element, attr) {

                        var transcludeElement = element.find("ng-transclude");
                        if (scope.name) {
                            fluidTaskService.findTaskByName(scope.name).
                                then(function (data) {
                                    scope.load(data);
                                });
                        } else if (scope.url) {
                            fluidTaskService.findTaskByUrl(scope.url).
                                then(function (data) {
                                    scope.load(data);
                                });
                        } else {
                            throw "task name or url is required.";
                        }

                        scope.open = function (page, workspace) {
                            var fluidFrame = new FluidFrame(scope.frame);
                            fluidFrame.openTask(scope._taskName, page, workspace);
                        };

                        scope.load = function (data) {
                            var task = new FluidTask(data);
                            scope._taskName = task.name;

                            scope._pages = task.pages;

                            element.html(transcludeElement.html());

                            element.attr("title", task.title);
                            var openTask = element.find("[open-task]");
                            if (openTask) {
                                openTask.attr("ng-click", "open()");
                            }
                            var icon = element.find(".task-icon");
                            if (icon) {
                                var iconStyle = icon.attr("style");
                                var iconClass = icon.attr("class");
                                var height = icon.attr("height");
                                var width = icon.attr("width");

                                if (task.useImg) {
                                    var img = $("<img>");
                                    img.attr("ng-src", task.imgSrc);

                                    img.attr("height", height ? height : 15);
                                    img.attr("width", width ? width : 15);

                                    if (iconClass) {
                                        img.attr("class", iconClass);
                                    }
                                    if (iconStyle) {
                                        img.attr("style", iconStyle);
                                    }
                                    icon.replaceWith(img.get());
                                } else {
                                    var i = $("<i>");
                                    i.attr("ng-class", "'" + task.glyph + "'");
                                    if (iconClass) {
                                        i.attr("class", iconClass);
                                    }
                                    if (iconStyle) {
                                        i.attr("style", iconStyle);
                                    }
                                    icon.replaceWith(i.get());
                                }
                            }
                            var label = element.find(".task-label");
                            if (label) {
                                var labelClass = label.attr("class");
                                var labelStyle = label.attr("style");
                                var elem = $("<span>");
                                if (labelClass) {
                                    elem.addClass(labelClass);
                                }
                                if (labelStyle) {
                                    elem.attr("style", labelStyle);
                                }

                                elem.html(task.title);
                                label.replaceWith(elem.get());
                            }
                            var pages = element.find(".task-pages");
                            if (pages) {
                                pages.attr("ng-repeat", "page in _pages | pages");
                                var pageLabel = pages.find(".page-label");
                                if (pageLabel) {
                                    pageLabel.html("{{page.title}}");
                                }
                                var openPage = pages.find("[open-page]");
                                if (openPage) {
                                    openPage.attr("ng-click", "open(page.name)");
                                }
                            }


                            compile(element.contents())(scope);
                        }
                    }
                }
            }
        }])
    .provider("taskState", function () {
        var url, ajax, taskArray;
        return {
            setAjax: function (value) {
                ajax = value;
            },
            setUrl: function (value) {
                url = value;
            },
            setTask: function (value) {
                if (taskArray == null) {
                    taskArray = [];
                }

                var exists = false;

                for (var i = 0; i < taskArray.length; i++) {
                    if (taskArray[i].name === value.name) {
                        exists = true;
                    }
                }
                if (!exists) {
                    taskArray.push(value);
                }
            },
            setTasks: function (value) {
                taskArray = value
            },
            $get: ["$http", "sessionService", "$q", "$rootScope", "$timeout", "fluidTaskService", function (h, ss, q, rs, t, taskService) {

                ajax = (url ? true : false) || ajax;

                if (ajax) {
                    console.debug("fluid-task-taskState.url", url);
                }
                console.debug("fluid-task-taskState.taskArray", taskArray);
                return q(function (resolve, reject) {
                        var length = taskArray ? taskArray.length - 1 : 0;
                        var value = {done: false};
                        angular.forEach(taskArray, function (task, $index) {
                            if (!ss.containsKey(taskKey + task.name)) {
                                if (task.url) {
                                    taskService.findTaskByUrl(task.url);
                                } else {
                                    ss.addSessionProperty(taskKey + task.name, task);
                                }
                            }

                            if (length === $index) {
                                this.done = true;
                            }

                        }, value);
                        var counter = 0;

                        function timeOut() {
                            console.debug("fluidtask: timeOut: ", value);
                            if (counter === timeout) {
                                reject(EVENT_TIME_OUT);
                                return;
                            }
                            if (value.done) {
                                resolve(EVENT_TASK_LOADED);
                                console.debug("fluidtask: resolve: ", value);
                                return;
                            }
                            counter++;
                            t(timeOut, 1000);
                        }

                        timeOut();

                    }
                ).then(function (event) {
                        console.debug("fluidtask: resolve-event: ", event);
                        rs.$broadcast(event);
                    });

            }]
        }

    })
    .factory("fluidTaskService", ["sessionService", "$http", "$q", "fluidStateService", "$rootScope", "$timeout", "$resource", function (ss, h, q, fss, rs, t, r) {
        var taskService = {};

        function timeoutEvent(data) {
            if (data === EVENT_TIME_OUT) {
                rs.$broadcast(EVENT_TIME_OUT, "Task name not found.");
            } else {
                return data;
            }
        }

        taskService.findTaskByName = function (name) {
            console.debug("fluidTask-fluidTaskService-findTaskByName.name", name);
            var key = taskKey + name;
            return q(function (resolve, reject) {

                function waitForTask(counter) {
                    console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.key", counter);
                    console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.counter", counter);
                    console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.fss", fss);
                    if (ss.containsKey(key)) {
                        console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.getSessionProperty", ss.getSessionProperty(key));
                        resolve(ss.getSessionProperty(key));
                        return;
                    } else if (counter === timeout) {
                        reject(EVENT_TIME_OUT);
                        return;
                    }
                    counter++;
                    t(waitForTask, 1000);
                }

                if (ss.containsKey(key)) {
                    resolve(ss.getSessionProperty(key));
                } else {
                    waitForTask(0);
                }

            }).then(timeoutEvent);
        };
        taskService.findTaskByUrl = function (url) {
            console.debug("fluidTask-fluidTaskService-findTaskByUrl.url", url);
            var deferred = q.defer();

            if (fss.urlKeys[url] != null) {
                var key = this.urlKeys[url];
                if (ss.containsKey(key)) {
                    deferred.resolve(ss.getSessionProperty(key));
                }
            } else {
                return h.get(url).success(function (data) {
                    var key = taskKey + data.name;
                    fss.urlKeys[url] = key;
                    ss.addSessionProperty(key, data);
                    console.debug("fluidTask-fluidTaskService.cacheTask.data", data);
                });
            }

            return deferred.promise;
        }
        taskService.loadAjax = function (task) {
            return q(function (resolve, reject) {

            });
        }
        return taskService;
    }])
    .factory("FluidTask", ["fluidTaskService", "$resource", "fluidFrameHandler", function (fluidTaskService, r, fluidFrameHandler) {
        //TODO: handle task state here; use this in fluidPanel
        var fluidTask = function (defaultTask) {
            var task = {};
            angular.copy(defaultTask, task);

            if (task.ajax) {
                if (task.ajax.url) {
                    if (!task.actions) {
                        task.actions = [];
                    }
                    if (!task.ajax.param) {
                        task.ajax.param = {};
                    }
                    task.resource = r(task.ajax.url, task.ajax.param, task.actions);
                } else {
                    throw "Task ajax.url is required!";
                }
            }

            task.load = function (ok, failed) {
                this.onLoad(function () {
                    ok();
                }, function () {
                    failed();
                });
            };

            task.close = function (ok, cancel) {
                this.onClose(function () {
                    ok();
                }, function () {
                    cancel();
                })
            };

            task.onClose = function (ok, cancel) {
                ok();
            }

            task.onLoad = function (ok, failed) {
                ok();
            };

            task.open = function ($event, frame) {
                if (!task.active) {
                    task.active = true;
                }

                var frame = fluidFrameHandler.frames[frameKey + task.frame];

                if (frame.fullScreen) {
                    frame.switchTo(task);
                } else {
                    var curFrame = $(".fluid-frame[name='" + frame.name + "']");
                    curFrame
                        .ready(function () {
                            var panel = curFrame.find("div.fluid-panel:eq(" + task.index + ")");
                            panel.ready(function () {
                                curFrame.scrollTo(panel, 200);
                            });
                        });
                    console.debug("fluid-task-task.open", "div.fluid-panel :eq(" + task.index + ")");
                }
            };


            task.panel = function () {
                return $("#_id_fp_" + task.fluidId);
            };

            console.debug("fluidTask-FluidTask.newTask", task);
            return task;
        }
        return fluidTask;
    }])
    .service("fluidStateService", [function () {
        this.loaded = false;
        this.urlKeys = [];
        return this;
    }]);

