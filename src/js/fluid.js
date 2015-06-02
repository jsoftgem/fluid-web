/**Fluid Web v0.0.1
 * Created by Jerico de Guzman
 * October 2014**/
'use strict';

var fluidComponents = angular.module("fluid", ["oc.lazyLoad", "LocalStorageModule", "ngResource", "templates-dist", "fluidSession",
    "fluidHttp", "fluidFrame", "fluidMessage", "fluidOption", "fluidTool", "fluidPage", "fluidPanel", "fluidTasknav", "fluidTask", "fluidTaskcontrols",
    "fluidFactories"]);

var EVENT_TIME_OUT = "TIME_OUT", EVENT_TASK_LOADED = "TASK_LOAD";

fluidComponents.config(["$httpProvider", "localStorageServiceProvider", function (h, ls) {
    ls.setPrefix("fluid")
        .setStorageType("sessionStorage")
        .setNotify(true, true);
    h.interceptors.push("fluidInjector");
}]);

fluidComponents.run(["taskState", function (ts, lg) {
}]);

fluidComponents
    .directive("fluidPermissionEnabled", ["fluidHttpService", "$compile", "sessionService", function (f, c, ss) {
        return {
            restrict: "A",
            scope: {task: "=", page: "="},
            link: function (scope, element, attr) {


                if (attr.method) {
                    scope.method = attr.method;
                }
                console.debug("permissionEnabled-url", f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method);

                var url = f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method;

                var enabled = ss.getSessionProperty(url);

                console.debug("permissionEnabled", enabled);

                if (enabled !== null) {
                    console.debug("permissionEnabled-old", enabled);
                    if (enabled === 'false') {
                        element.attr("disabled", "");
                    }
                }

                if (enabled === null) {
                    f.get(url, scope.task)
                        .success(function (data) {
                            if (!data) {
                                element.attr("disabled", "");
                            }
                            ss.addSessionProperty(url, data);
                        });
                    console.debug("permissionEnabled-new");
                }
            }

        }
    }])
    .directive("fluidPermissionVisible", ["fluidHttpService", "$compile", "sessionService", function (f, c, ss) {
        return {
            restrict: "A",
            scope: {task: "=", page: "="},
            link: function (scope, element, attr) {

                if (attr.method) {
                    scope.method = attr.method;
                }
                console.debug("permissionVisible-url", f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method);

                var url = f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method;

                var visible = ss.getSessionProperty(url);

                console.debug("permissionVisible", visible);

                if (visible !== null) {
                    console.debug("permissionVisible-old", visible);

                    if (visible === 'false') {
                        element.addClass("hidden");
                        console.debug("permissionVisible-hidden");
                    } else {
                        console.debug("permissionVisible-visible");
                        element.removeClass("hidden");
                    }

                }

                if (visible === null) {
                    f.get(url, scope.task)
                        .success(function (data) {
                            if (!data) {
                                element.addClass("hidden");
                            }
                            ss.addSessionProperty(url, data);
                        });

                }

            }

        }
    }])
    .directive("column", ["$rootScope", function (rs) {
        return {
            restrict: "A",
            scope: false,
            link: function (scope, element, attr) {

                if (attr.column) {
                    scope.column = attr.column;
                }


                scope.$watch(function (scope) {
                        return attr.column;
                    }, function (column, oldColumn) {
                        console.debug("column-old", oldColumn);
                        console.debug("column", column);
                        element.removeClass("col-lg-" + oldColumn);
                        element.addClass("col-lg-" + column);
                        scope.column = column;
                    }
                );

                element
                    .addClass("col-md-12")
                    .addClass("col-sm-12")
                    .addClass("col-xs-12");

                scope.$watch(function (scope) {
                    if (scope.task) {
                        return scope.task.size;
                    }

                }, function (size) {
                    switch (size) {
                        case 25:
                            element.removeClass("col-lg-" + scope.column);
                            element.addClass("col-lg-12")
                                .addClass("col-md-12")
                                .addClass("col-sm-12")
                                .addClass("col-xs-12")
                            break;
                        case 50:
                            if (rs.viewport === "lg") {
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-lg-" + scope.column);
                            } else if (rs.viewport === "md") {
                                element.removeClass("col-lg-" + scope.column);
                                element.addClass("col-md-" + scope.column);
                            } else if (rs.viewport === "sm") {
                                element.removeClass("col-lg-" + scope.column);
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-sm-12");
                            } else if (rs.viewport === "xs") {
                                element.removeClass("col-lg-" + scope.column);
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-xs-12");
                            }
                            break;
                        case 75:
                            if (rs.viewport === "lg") {
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-lg-" + scope.column);
                            } else if (rs.viewport === "md") {
                                element.removeClass("col-lg-" + scope.column);
                                element.addClass("col-md-12");
                            } else if (rs.viewport === "sm") {
                                element.removeClass("col-lg-" + scope.column);
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-sm-12");
                            } else if (rs.viewport === "xs") {
                                element.removeClass("col-lg-" + scope.column);
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-xs-12");
                            }
                            break;
                        case 100:
                            if (rs.viewport === "lg") {
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-lg-" + scope.column);
                            } else if (rs.viewport === "md") {
                                element.addClass("col-md-" + scope.column);
                                element.removeClass("col-lg-" + scope.column);
                            } else if (rs.viewport === "sm") {
                                element.removeClass("col-lg-" + scope.column);
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-sm-12");
                            } else if (rs.viewport === "xs") {
                                element.removeClass("col-lg-" + scope.column);
                                element.removeClass("col-md-" + scope.column);
                                element.addClass("col-xs-12");
                            }
                            break;
                    }

                    console.debug("column-size", size);
                });


            }
        }
    }]);

function setChildIndexIds(element, taskId, suffix, depth) {
    var children = $(element).children();
    var id = $(element).attr("id");
    if (id) {
        id = id + "{{$index}}tsk" + taskId + "suf" + suffix + "dep" + depth;

    } else {
        id = "grid{{$index}}tsk" + taskId + "suf" + suffix + "dep" + depth;
    }
    ++depth;
    $(element).attr("id", id);
    if (children.length > 0) {
        for (var i = 0; i < children.length; i++) {
            var element = children[i];
            setChildIndexIds(element, taskId, suffix + "_" + i, depth);
        }
    } else {
        return;
    }
}

fluidComponents
    .service("fluidMonitorService", [function () {
        //TODO: fluidMonitorService
    }]);

fluidComponents
    .factory("fluidInjector", ["$q", "$rootScope", "sessionService", "fluidLoaderService", "responseEvent",
        function (q, rs, ss, fls, r) {

            return {
                "request": function (config) {
                    if (fls.enabled) {
                        fls.loaded = false;
                    }

                    config.headers["Access-Control-Allow-Origin"] = "*";

                    /*  console.debug("fluidInjector-request.config", config);

                     console.debug("fluidInjector-request.pages", fps.pages);

                     if (fps.pages[config.url]) {
                     var fluidPage = new FluidPage(fps.pages[config.url]);
                     console.debug("fluidInjector-request.fluidPage", fluidPage);
                     fluidPage.preLoad();
                     config.url = fluidPage.home;
                     }*/

                    if (ss.isSessionOpened()) {
                        config.headers['Authorization'] = ss.getSessionProperty(AUTHORIZATION);
                    }

                    console.debug("fluidInjector-request.config-altered", config);
                    return config;
                },
                "requestError": function (rejection) {
                    fls.loaded = true;
                    fls.enabled = true;
                    return q.reject(rejection);
                },
                "response": function (response) {
                    fls.loaded = true;
                    fls.enabled = true;
                    r.callEvent(response);
                    return response;
                },
                "responseError": function (rejection) {
                    fls.loaded = true;
                    fls.enabled = true;
                    return q.reject(rejection);
                }
            };
        }])
    .factory("responseEvent", ["$location", "$rootScope", function (l, rs) {

        var responseEvent = {};
        responseEvent.responses = [];

        responseEvent.addResponse = function (evt, statusCode, redirect, path) {
            responseEvent.responses.push({
                "evt": evt,
                "statusCode": statusCode,
                "redirect": redirect,
                "path": path
            });

        }

        responseEvent.callEvent = function (res) {
            angular.forEach(responseEvent.responses, function (response) {
                if (response.statusCode === res.statusCode) {
                    if (response.evt) {
                        rs.$broadcast(response.evt, response.data, response.statusText);
                    } else if (response.redirect) {
                        l.path(response.path);
                    }

                }
            });
        }

        return responseEvent;

    }]);

/*Bootsrap Utilities*/
fluidComponents.directive("bootstrapViewport", ["$rootScope", "$window", function (rs, w) {
    return {
        restrict: "AE",
        replace: true,
        template: "<span class='hidden'><span class='fluid-view-lg'></span><span class='fluid-view-md'></span><span class='fluid-view-sm'></span><span class='fluid-view-xs'></span></span>",
        link: function (scope, element, attr) {

            if (element.find("span.fluid-view-lg").css("display") === 'block') {
                rs.viewport = "lg";
            } else if (element.find("span.fluid-view-md").css("display") === 'block') {
                rs.viewport = "md";
            } else if (element.find("span.fluid-view-sm").css("display") === 'block') {
                rs.viewport = "sm";
            } else if (element.find("span.fluid-view-xs").css("display") === 'block') {
                rs.viewport = "xs";
            }

            $(w).on("resize", function () {
                if (rs) {
                    if (element.find("span.fluid-view-lg").css("display") === 'block') {
                        rs.viewport = "lg";
                    } else if (element.find("span.fluid-view-md").css("display") === 'block') {
                        rs.viewport = "md";
                    } else if (element.find("span.fluid-view-sm").css("display") === 'block') {
                        rs.viewport = "sm";
                    } else if (element.find("span.fluid-view-xs").css("display") === 'block') {
                        rs.viewport = "xs";
                    }
                }
            });
        }
    }
}]);
fluidComponents
    .directive("hidden25", ["$rootScope", "fluidFrameService", "$window", function (rs, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                scope.rs = rs;

                if (rs.viewport === 'lg' && !f.fullScreen) {
                    if (scope.task.size === 25) {
                        element.addClass("hideSize25");
                    } else {
                        element.removeClass("hideSize25");
                    }
                } else {
                    element.removeClass("hideSize25");
                }

                if (scope.task) {
                    scope.$watch(function (scope) {
                        return scope.task.size;
                    }, function (value) {
                        if (rs.viewport === 'lg' && !f.fullScreen) {
                            if (value === 25) {
                                element.addClass("hideSize25");
                            } else {
                                element.removeClass("hideSize25");
                            }
                        } else {
                            element.removeClass("hideSize25");
                        }
                    });
                }

                $(w).on("resize", function () {
                    if (scope) {
                        if (scope.rs.viewport === 'lg' && !f.fullScreen) {
                            if (scope.task.size === 25) {
                                element.addClass("hideSize25");
                            } else {
                                element.removeClass("hideSize25");
                            }

                        } else {
                            element.removeClass("hideSize25");
                        }
                    }
                });


            }
        }
    }])
    .directive("hidden50", ["$rootScope", "fluidFrameService", "$window", function (rs, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                scope.rs = rs;

                if (rs.viewport === 'lg' && !f.fullScreen) {
                    if (scope.task.size === 50) {
                        element.addClass("hideSize50");
                    } else {
                        element.removeClass("hideSize50");
                    }
                } else {
                    element.removeClass("hideSize50");
                }

                if (scope.task) {
                    scope.$watch(function (scope) {
                        return scope.task.size;
                    }, function (value) {
                        if (rs.viewport === 'lg' && !f.fullScreen) {
                            if (value === 50) {
                                element.addClass("hideSize50");
                            } else {
                                element.removeClass("hideSize50");
                            }
                        } else {
                            element.removeClass("hideSize50");
                        }
                    });
                }

                $(w).on("resize", function () {
                    if (scope) {
                        if (scope.rs.viewport === 'lg' && !f.fullScreen) {
                            console.debug("hidden50-viewport", rs.viewport);
                            console.debug("hidden50-size", scope.task.size);
                            if (scope.task.size === 50) {
                                element.addClass("hideSize50");
                            } else {
                                element.removeClass("hideSize50");
                            }

                        } else {
                            element.removeClass("hideSize50");
                        }
                    }
                });


            }
        }
    }])
    .directive("hidden75", ["$rootScope", "fluidFrameService", "$window", function (rs, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                scope.rs = rs;

                if (rs.viewport === 'lg' && !f.fullScreen) {
                    if (scope.task.size === 75) {
                        element.addClass("hideSize75");
                    } else {
                        element.removeClass("hideSize75");
                    }
                } else {
                    element.removeClass("hideSize75");
                }

                if (scope.task) {
                    scope.$watch(function (scope) {
                        return scope.task.size;
                    }, function (value) {
                        if (rs.viewport === 'lg' && !f.fullScreen) {
                            if (value === 75) {
                                element.addClass("hideSize75");
                            } else {
                                element.removeClass("hideSize75");
                            }
                        } else {
                            element.removeClass("hideSize75");
                        }
                    });
                }

                $(w).on("resize", function () {
                    if (scope) {
                        if (scope.rs.viewport === 'lg' && !f.fullScreen) {
                            if (scope.task.size === 75) {
                                element.addClass("hideSize75");
                            } else {
                                element.removeClass("hideSize75");
                            }

                        } else {
                            element.removeClass("hideSize75");
                        }
                    }
                });


            }
        }
    }])
    .directive("hidden100", ["$rootScope", "fluidFrameService", "$window", function (rs, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                scope.rs = rs;

                if (rs.viewport === 'lg' && !f.fullScreen) {
                    if (scope.task.size === 100) {
                        element.addClass("hideSize100");
                    } else {
                        element.removeClass("hideSize100");
                    }
                } else {
                    element.removeClass("hideSize100");
                }

                if (scope.task) {
                    scope.$watch(function (scope) {
                        return scope.task.size;
                    }, function (value) {
                        if (rs.viewport === 'lg' && !f.fullScreen) {
                            if (value === 100) {
                                element.addClass("hideSize100");
                            } else {
                                element.removeClass("hideSize100");
                            }
                        } else {
                            element.removeClass("hideSize100");
                        }
                    });
                }

                $(w).on("resize", function () {
                    if (scope) {
                        if (scope.rs.viewport === 'lg' && !f.fullScreen) {
                            console.debug("hidden100-viewport", rs.viewport);
                            console.debug("hidden100-size", scope.task.size);
                            if (scope.task.size === 100) {
                                element.addClass("hideSize100");
                            } else {
                                element.removeClass("hideSize100");
                            }

                        } else {
                            element.removeClass("hideSize100");
                        }
                    }
                });


            }
        }
    }])
    .directive("hiddenFullscreenXs", ["$rootScope", "fluidFrameService", "$window", function (rs, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {

                var viewport = rs.viewport;

                if (viewport === 'xs' && f.fullScreen) {
                    element.addClass("hideFullscreenXs");
                } else {
                    element.removeClass("hideFullscreenXs");
                }

                $(w).on("resize", function () {
                    var viewport = rs.viewport;

                    if (viewport === 'xs' && f.fullScreen) {
                        element.addClass("hideFullscreenXs");
                    } else {
                        element.removeClass("hideFullscreenXs");
                    }

                });

            }
        }
    }])
    .directive("hiddenFullscreenSm", ["$rootScope", "fluidFrameService", "$window", function (rs, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {

                var viewport = rs.viewport;

                if (viewport === 'sm' && f.fullScreen) {
                    element.addClass("hideFullscreenSm");
                } else {
                    element.removeClass("hideFullscreenSm");
                }

                $(w).on("resize", function () {
                    var viewport = rs.viewport;

                    if (viewport === 'sm' && f.fullScreen) {
                        element.addClass("hideFullscreenSm");
                    } else {
                        element.removeClass("hideFullscreenSm");
                    }

                });
            }
        }
    }])
    .directive("hiddenFullscreenMd", ["$rootScope", "fluidFrameService", "$window", function (rs, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                var viewport = rs.viewport;

                if (viewport === 'md' && f.fullScreen) {
                    element.addClass("hideFullscreenMd");
                } else {
                    element.removeClass("hideFullscreenMd");
                }

                $(w).on("resize", function () {
                    var viewport = rs.viewport;
                    if (viewport === 'md' && f.fullScreen) {
                        element.addClass("hideFullscreenMd");
                    } else {
                        element.removeClass("hideFullscreenMd");
                    }

                });
            }
        }
    }])
    .directive("hiddenFullscreenLg", ["$rootScope", "fluidFrameService", "$window", function (rs, f, w) {
        return {
            restrict: "AC",
            scope: true,
            link: function (scope, element, attr) {

                var viewport = rs.viewport;

                if (viewport === 'lg' && f.fullScreen) {
                    element.addClass("hideFullscreenLg");
                } else {
                    element.removeClass("hideFullscreenLg");
                }


                $(w).on("resize", function () {
                    var viewport = rs.viewport;

                    if (viewport === 'lg' && f.fullScreen) {
                        element.addClass("hideFullscreenLg");
                    } else {
                        element.removeClass("hideFullscreenLg");
                    }
                });
            }
        }
    }])
    .directive("fillHeight", ["$window", function ($w) {
        return {
            restrict: "A",
            link: function (scope, element, attr) {

                var w = angular.element($w);

                if (attr.reduceHeight) {
                    scope.reduceHeight = attr.reduceHeight;
                }

                w.bind("resize", function () {
                    fillHeight(element, w.height(), scope.reduceHeight);
                });

                console.debug("fluid-fillHeight-window-height: ", w.height());
                fillHeight(element, w.height(), scope.reduceHeight);

            }
        }
    }]);

fluidComponents
    .filter('reverse', function () {
        return function (items) {
            if (items) {
                return items.slice().reverse();
            }
        };
    })
    .filter("pages", function () {
        return function (items) {
            if (items) {
                return filterPage(items);
            }
        }
    });
/**Prototypes**/


/** TODO:
 *  1) FluidTasknav - taskbar (active, minimize, fullscreen, settings,scrollTo); - Scrap (for FluidPlatform)
 *  2) FluidPanel - fullScreen - disable sizes;
 *  3) FluidBreadcrumb - responsive;
 *  4) FluidPanel - XS, SM mobile view;
 *  5) FluidFrame - item must be assigned to FluidPanel upon opening of task; - Scrap (for FluidPlatform)
 *  6) FluidTasknav - Task widget, widgetType: alert, overview, media and message; custom icon glyph/img - Scrap (for FluidPlatform)
 *  7) FluidTask - onClose, onLoad, onDestroy life-cycle
 * **/