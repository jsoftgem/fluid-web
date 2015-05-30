/**
 * Created by jerico on 4/29/2015.
 */
angular.module("fluidTasknav", ["fluidTask", "fluidFrame", "fluidPanel"])
    .directive("fluidTasknav", ["$templateCache", "fluidTasknav", "fluidTaskService", "fluidFrameService", "FluidPanelModel",
        function (tc, FluidTasknav, fluidTaskService, FrameService, FluidPanel) {
            return {
                restrict: "AE",
                scope: false,
                template: tc.get("templates/fluid/fluidTasknav.html"),
                replace: true,
                link: function (scope, element, attr) {

                    if (attr.showOnLoad === "true") {
                        $("body").toggleClass("toggle-offcanvas");
                    }

                    if (attr.name) {
                        scope.fluidTasknav = new FluidTasknav({
                            name: attr.name
                        });

                        if (attr.frame) {
                            scope.fluidTasknav.frame = attr.frame;
                        }

                    } else {
                        throw "Name is required.";
                    }

                    scope.getTask = function (item) {
                        fluidTaskService.findTaskByName(item.name)
                            .then(function (task) {
                                item.title = task.title;
                                item.pages = task.pages;
                                item.useImg = task.useImg;
                                item.imgSrc = task.imgSrc;
                                item.glyph = task.glyph;
                            })
                    }

                    scope.getPanel = function (task) {
                        return new FluidPanel(task);
                    }

                }
            }
        }])
    .factory("fluidTasknav", ["fluidTasknavService", "fluidFrameService", function (fluidTasknavService, FrameService) {

        var tasknav = function (data) {

            if (data.name) {
                this.name = data.name;
            }
            if (data.frame) {
                this.frame = data.frame;
            }

            if (fluidTasknavService.getNav(this.name) != null) {
                return fluidTasknavService.getNav(this.name);
            } else {
                this.groups = [];

                this.toggle = function () {
                    $("body").toggleClass("toggle-offcanvas");
                }

                this.addGroup = function (group) {
                    this.groups.push(group);
                }

                this.getFrameService = function () {
                    return new FrameService(this.frame);
                }

                fluidTasknavService.putNav(this.name, this);

                return this;
            }
        }

        return tasknav;
    }])
    .service("fluidTasknavService", [function () {
        this.tasknavs = [];
        this.putNav = function (name, tasknav) {
            this.tasknavs[name] = tasknav;
        }
        this.getNav = function (name) {
            return this.tasknavs[name];
        }

        this.toggle = function (id) {
            if ($("body").hasClass("toggle-offcanvas")) {
                $("body").removeClass("toggle-offcanvas");
            } else {
                $("body").addClass("toggle-offcanvas");
            }
        }


        return this;
    }]);