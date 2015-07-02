/**
 * Created by Jerico on 5/29/2015.
 */
angular.module("fluidFactories", ["fluidTask"])
    .factory("FluidTaskGroup", [function () {

        var taskGroup = function (param) {
            if (param.title) {
                this.title = param.title;
            }
            if (param.name) {
                this.name = param.name;
            }
            if (param.tasks) {
                this.tasks = param.tasks;
            } else {
                this.tasks = [];
            }

            this.addTask = function (taskItem, $index) {
                var length = this.tasks.length;

                if ($index && (length < $index)) {
                    this.tasks.push(taskItem);
                } else {
                    this.tasks.splice($index, 0, taskItem);
                }
            }
        }

        return taskGroup;
    }])
    .factory("FluidTaskItem", ["fluidTaskService", function (FluidTask) {
        var taskItem = function (param) {

            if (param.name) {
                this.name = param.name;
            }

            //TODO: other options here
            return this;
        }


        return taskItem;
    }])
    .factory("FluidLoader", ["factoryServer", function (factoryServer) {
        var fluidLoader = function (fluidPanel) {
            var key = "loader_" + fluidPanel.id;
            if (factoryServer.get(key) != null) {
                return factoryServer.get(key);
            } else {
                this.$ = fluidPanel.$.find(".fluid-loader");
                this.load = function () {

                }
                factoryServer.put(key, this);
            }

            return this;
        }

        return fluidLoader;
    }
    ])
    .service("factoryServer", [function () {
        this.factories = [];

        this.put = function (name, obj) {
            this.factories[name] = obj;
        }

        this.get = function (name) {
            this.factories[name];
        }

    }]);