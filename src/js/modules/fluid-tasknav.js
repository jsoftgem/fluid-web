/**
 * Created by jerico on 4/29/2015.
 */
angular.module("fluidTasknav", ["fluidHttp", "fluidSession"])
    .directive("fluidTasknav", ["$templateCache", "sessionService", "fluidHttpService", function (tc, ss, fhs) {
        return {
            restrict: "AE",
            scope: false,
            template: tc.get("templates/fluid/fluidTasknav.html"),
            replace: true,
            link: function (scope, element, attr) {

                if (attr.show === "true") {
                    console.info("fluidTasknav", attr.show);
                    $("body").addClass("toggle-offcanvas");
                }

                //TODO: position support: default is left
                if (attr.position) {
                    console.info("attr.position", attr.position);
                    if (attr.position === "right") {
                        element.addClass("right");
                    } else {
                        element.removeClass("right");
                    }
                }


                if (attr.method) {
                    scope.method = attr.method;
                }

                //TODO: ajax data
                scope.$watch(function () {
                    if (attr.url) {
                        return attr.url
                    }
                }, function (url) {
                    scope.loaded = false;
                    if (ss.containsKey(url)) {
                        scope.data = ss.getSessionProperty(url);
                        scope.loaded = true;
                    } else {
                        var method = (scope.method ? scope.method : "get");
                        scope.data = fhs.queryLocal({
                            url: url,
                            method: method
                        }).success(function (data) {
                            scope.data = data;
                        }).then(function () {
                            scope.loaded = true;
                        });
                    }
                });


            },
            transclude: true
        }
    }])
    .service("fluidTasknavService", ["sessionService", function (ss) {

        this.toggle = function (id) {
            if ($("body").hasClass("toggle-offcanvas")) {
                $("body").removeClass("toggle-offcanvas");
            } else {
                $("body").addClass("toggle-offcanvas");
            }
        }


        return this;
    }]);