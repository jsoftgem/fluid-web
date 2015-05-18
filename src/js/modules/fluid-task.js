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
            $get: ["$http", "sessionService", "$q", "$rootScope", "$timeout", "fluidTaskService", function (h, ss, q, rs, t, taskService) {

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
                                t(function () {
                                    if (counter === timeout) {
                                        reject(EVENT_TIME_OUT);
                                    }
                                    if (value.done) {
                                        resolve(EVENT_TASK_LOADED);
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
    .factory("fluidTaskService", ["sessionService", "$http", "$q", "fluidStateService", "$rootScope", "$timeout", function (ss, h, q, fss, rs, t) {
        var taskService = {};

        function timeoutEvent(data) {
            if (data === EVENT_TIME_OUT) {
                rs.$broadcast(EVENT_TIME_OUT, "Task name not found.");
            } else {
                /*if (data.stateAjax) {
                 var url = data.stateAjax.url;
                 if (!data.stateAjax.actions) {
                 data.stateAjax.actions = [];
                 }
                 if (url) {
                 if (!data.stateAjax.actions) {
                 data.stateAjax.actions = [];
                 }
                 if (!data.stateAjax.param) {
                 data.stateAjax.param = {}
                 }

                 data.resource = r(url, data.stateAjax.param, data.stateAjax.actions);

                 } else {
                 throw "Task stateAjax.url is required!";
                 }
                 }*/
                return data;
            }
        }

        taskService.findTaskByName = function (name) {
            console.info("fluidTask-fluidTaskService-findTaskByName.name", name);
            var key = taskKey + name;
            return q(function (resolve, reject) {

                function waitForTask(counter) {
                    console.info("fluidTask-fluidTaskService-findTaskByName-waitForTask.key", counter);
                    console.info("fluidTask-fluidTaskService-findTaskByName-waitForTask.counter", counter);
                    console.info("fluidTask-fluidTaskService-findTaskByName-waitForTask.fss", fss);

                    t(function () {
                        if (ss.containsKey(key)) {
                            console.info("fluidTask-fluidTaskService-findTaskByName-waitForTask.getSessionProperty", ss.getSessionProperty(key));
                            resolve(ss.getSessionProperty(key));
                        } else if (counter === timeout) {
                            reject(EVENT_TIME_OUT);
                        } else {
                            counter++;
                            waitForTask(counter);
                        }
                    }, 1000);
                }

                if (ss.containsKey(key)) {
                    resolve(ss.getSessionProperty(key));
                } else {
                    waitForTask(0);
                }

            }).then(timeoutEvent);
        }
        taskService.findTaskByUrl = function (url) {
            console.info("fluidTask-fluidTaskService-findTaskByUrl.url", url);
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
                    console.info("fluidTask-fluidTaskService.cacheTask.data", data);
                });
            }

            return deferred.promise;
        }
        return taskService;
    }])
    .factory("FluidTask", ["fluidTaskService", "$resource", function (fluidTaskService, r) {
        //TODO: handle task state here; use this in fluidPanel
        var fluidTask = function (name) {
            return fluidTaskService.findTaskByName(name);
        }
        return fluidTask;
    }])
    .service("fluidStateService", [function () {
        this.loaded = false;
        this.urlKeys = [];
        return this;
    }]);

