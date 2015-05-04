/**
 * Created by Jerico on 4/29/2015.
 */
//TODO: create state manager for task; task should not be altered with scope.
var taskKey = "$task_";

angular.module("fluidTask", ["oc.lazyLoad", "fluidSession"])
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
            $get: function () {
                return {url: url, ajax: (url ? true : false) || ajax, tasks: taskArray}
            }
        }

    })
    .provider("Task", function () {
        this.$get = ["sessionService", function (ss) {

            var task = function (name) {
                var key = taskKey + name;
                if (ss.containsKey(key))
                    return ss.getSessionProperty(key);
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
    }
    ])
    .service("fluidStateService", ["sessionService", "taskState", "$http", "Task", function (ss, tsp, h, Task) {
        this.loadTask = function () {
            if (tsp.ajax) {
                h.get(tsp.url)
                    .success(function (data) {
                        angular.forEach(data, function (task) {
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
                        });

                    });

            } else {
                var taskArray = tsp.tasks;
                if (taskArray) {
                    angular.forEach(taskArray, function (task) {
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
                    });
                }
            }
        }
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

