/**
 * Created by Jerico on 4/27/2015.
 */
angular.module("moduleTaskConfig", ["fluid"])
    .controller("moduleTaskConfigCtrl", ["$scope", "fluidFrameService", "TaskControl", "FluidPage", "Task", function (s, ffs, TaskControl, FluidPage, Task) {
        s.task = new Task("moduleTaskConfig");

        console.info("moduleTaskConfigCtrl.task", s.task); //TODO: Task is not defined.

        var sample = new TaskControl(s.task);
        sample.glyph = "fa fa-gears";

        s.fluidFrameScreen = ffs;

        s.generic = {};

        s.newTask = {pages: []};

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