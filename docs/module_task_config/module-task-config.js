/**
 * Created by Jerico on 4/27/2015.
 */
angular.module("moduleTaskConfig", ["fluid"])
    .controller("moduleTaskConfigCtrl", ["$scope", "TaskControl", "FluidPage", "ToolBarItem", "FluidProgress", "$timeout", function (s, TaskControl, FluidPage, ToolBarItem, FluidProgress, t) {
        s.generic = {};
        s.newTask = [];

        s.sample = function () {

            s.progress.run("sample", function (ok, cancel, notify) {
                console.debug("moduleTaskConfig.sample.sample");
                var counter = 0;

                function sample() {
                    if (counter < 5) {
                        counter++;
                        notify("hello: " + counter, "info", 1);
                        t(sample, 500);
                    } else {
                        ok();
                    }
                }

                sample();
            }, {
                max: 5, min: 0, sleep: 1000
            });

            s.progress.onComplete("sample", function () {
                console.debug("moduleTaskConfig.sample.sample.complete");
            });

            s.progress.onComplete("sample2", function () {
                console.debug("moduleTaskConfig.sample.sample2.complete");
            });

            s.progress.run("sample2", function (ok, cancel, notify) {
                console.debug("moduleTaskConfig.sample.sample2");
                var counter = 0;

                function sample() {
                    if (counter < 5) {
                        counter++;
                        notify("hello 2: " + counter, "info", 1);
                        t(sample, 1000);
                        t
                    } else {
                        ok();
                    }
                }

                sample();
            }, {
                max: 5, min: 0, sleep: 1000
            });
        }

        s.fluidPage.onLoad = function (ok, cancel) {

            s.progress = new FluidProgress({
                id: "config_" + s.fluidPanel.id
            });

            /*      s.progress.run("sample", function (ok, cancel) {
             console.debug("moduleTaskConfig.sample.runner");
             ok();
             });
             s.progress.run("sample2", function (ok, cancel) {
             console.debug("moduleTaskConfig.sample.runner2");
             ok();
             });
             s.progress.run("sample3", function (ok, cancel) {
             console.debug("moduleTaskConfig.sample.runner3");
             ok();
             });
             s.progress.run("sample4", function (ok, cancel) {
             console.debug("moduleTaskConfig.sample.runner4");
             ok();
             });
             s.progress.run("sample5", function (ok, cancel) {
             console.debug("moduleTaskConfig.sample.runner5");
             ok();
             });*/

            console.info("moduleTaskConfig#moduleTaskConfigCtrl-onLoad.fluidPage", this);
            ok();
        }
        s.addTask = function (task) {

            console.info("addTask", task);
            var valid = true;

            if (!task.name) {
                s.fluid.message.danger("Task name is required.");
                valid = false;
            } else {
                task.id = task.name;
            }

            if (task.pages.length > 0) {
                var result = {homeCount: 0};
                angular.forEach(task.pages, function (page) {

                    if (page.isHome) {
                        result.homeCount++;
                    }

                }, result);

                if (result.homeCount > 0) {
                    if (result.homeCount > 1) {
                        s.fluid.message.danger("Task must not exceed 1 default page.");
                        valid = false;
                    }

                } else {
                    valid = false;
                    s.fluid.message.danger("Task must have a default page check (Is Home).");
                }

            } else {
                valid = false;
                s.fluid.message.danger("Task must have a page.");
            }


            if (valid) {
                angular.copy(task, s.genertic);
                s.newTask = {pages: []};
                ffs.pushTask(s.genertic);
            }
        }


    }]);