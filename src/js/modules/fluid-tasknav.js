/**
 * Created by jerico on 4/29/2015.
 */
angular.module("fluidTasknav", [])
    .directive("fluidTasknav", ["$templateCache", "fluidTasknav", function (tc, FluidTasknav) {
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
                    })
                }

            }
        }
    }])
    .factory("fluidTasknav", ["fluidTasknavService", function (fluidTasknavService) {

        var tasknav = function (data) {

            if (data.name) {
                this.name = data.name;
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

                fluidTasknavService.putNav(this.name, this);

                return this;
            }
        }

        return tasknav;
    }])
    .service("fluidTasknavService", [ function () {
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