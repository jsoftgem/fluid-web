/**
 * Created by Jerico on 4/29/2015.
 */
//TODO: create state manager for task; task should not be altered with scope.
var taskKey = "$task_";
var timeout = 30;//sets 30 seconds timeout.

angular.module("fluidTask", ["fluidSession"])
    .provider("taskState", function () {
        var url, ajax, taskArray;
        return {
            setAjax: function (value) {
                ajax = value;
            },
            setUrl: function (value) {
                url = value;
            },
            setTasks: function (value) {
                taskArray = value
            },
            $get: ["$http", "sessionService", "$q", "$rootScope", "$timeout", function (h, ss, q, rs, t) {

                ajax = (url ? true : false) || ajax;

                if (ajax) {
                    console.info("fluid-task-taskState.url", url);
                } else {
                    console.info("fluid-task-taskState.taskArray", taskArray);
                    return q(function (resolve, reject) {
                            var length = taskArray.length - 1;
                            var value = {done: false};
                            angular.forEach(taskArray, function (task, $index) {
                                if (!ss.containsKey(taskKey + task.name)) {
                                    if (task.url) {
                                        h.get(task.url)
                                            .success(function (dt) {
                                                var taskName = dt.name;
                                                if (task.name) {
                                                    taskName = task.name;
                                                }
                                                ss.addSessionProperty(taskKey + taskName, dt);
                                            });
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
                                t(function () {
                                    if (counter === timeout) {
                                        reject("TIME_OUT");
                                    }
                                    if (value.done) {
                                        resolve("TASK_LOADED");
                                    } else {
                                        timeOut();
                                    }
                                    counter++;
                                }, 1000);
                            }

                            timeOut();

                        }
                    ).then(function (event) {
                            rs.$broadcast(event);
                        });
                }
            }]
        }

    })
    .provider("Task", function () {
        this.$get = ["sessionService", function (ss) {

            var task = function (name) {
                var key = taskKey + name;
                if (ss.containsKey(key)) {
                   return ss.getSessionProperty(key);
                }
                return undefined;
            }

            return task;

        }];
    })
    .factory("fluidTaskService", ["Task", function (Task) {
        var taskService = function (task) {

            this.getDetaultTask = function () {
                var defaultTask = new Task(task.name);
                return defaultTask;
            }

            if (task.stateAjax) {
                var defaultTask = this.getDetaultTask();
            }
            // gets the homepage
            if (task.pages) {
                angular.forEach(task.pages, function (page) {
                    if (page.isHome) {
                        this.page = page;
                    }
                }, this);
            }


        }
        return taskService;
    }])
    .service("fluidStateService", ["sessionService", "$http", "Task", "$q", "taskState", "$rootScope", function (ss, h, Task, q, taskState, rs) {
        this.loaded = false;
        rs.$on("TASK_LOADED", function () {
            console.info("fluidTask-fluidStateService.taskLoaded", this);
        });
        return this;
    }])
    .directive("id", [function () {
        return {
            restrict: "A",
            scope: false,
            link: function (scope, element, attr) {
                if (scope.task) {
                    element.attr("id", attr.id + "_" + scope.task.id)
                }
            }
        }
    }]);

