/**Fluid Web v0.1.5
 * Created by Jerico de Guzman
 * October 2014**/
'use strict';

var fluidComponents = angular.module("fluid", ["oc.lazyLoad", "LocalStorageModule", "ngResource", "fluidTemplates", "fluidSession",
    "fluidHttp", "fluidFrame", "fluidMessage", "fluidOption", "fluidTool", "fluidPage", "fluidPanel", "fluidTasknav", "fluidTask", "fluidTaskcontrols",
    "fluidFactories"]);

var fidKey = /fid=[\w]*;/;
var pgKey = /pg=[\w]*;/;
var EVENT_TIME_OUT = "$taskLoadedError", EVENT_TASK_LOADED = "$taskLoadedSuccess";

fluidComponents.config(["$httpProvider", "localStorageServiceProvider", function (h, ls) {
    ls.setPrefix("fluid")
        .setStorageType("sessionStorage")
        .setNotify(true, true);
    h.interceptors.push("fluidInjector");
}]);

fluidComponents.run(["taskState", function (ts, lg) {
}]);

fluidComponents
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
    }])
    .service("$viewport", [function () {
        this.view = undefined;
        this.is = function (view) {
            return this.view === view;
        }
        return this;
    }])

fluidComponents
    .factory("fluidInjector", ["$q", "$rootScope", "sessionService", "fluidLoaderService", "responseEvent", "fluidPageService",
        function (q, rs, ss, fls, r, fps) {
            return {
                "request": function (config) {
                    if (fls.enabled) {
                        fls.loaded = false;
                    }
                    console.debug("fluid-fluidInjector.config.url", config.url);
                    console.debug("fluid-fluidInjector.config", config);

                    if (config.url) {
                        var fid = ('' + config.url).match(fidKey);
                        var pg = ('' + config.url).match(pgKey);
                        if (fid) {
                            config.headers["fid"] = fid[0].split("=")[1].replace(";", "");
                            config.url = config.url.replace(fid, "");
                        }

                        if (pg) {
                            var page = pg[0].split("=")[1].replace(";", "");
                            config.headers["pg"] = page;
                            config.url = config.url.replace(pg, "");

                            var pageState = fps.pageState(page);

                            console.debug("fluid-fluidInjector-request.fps", fps);

                            if (config.method === 'PUT' || config.method === 'POST' || config.method === 'DELETE') {
                                pageState.$updated = new Date().getTime();
                                console.debug("fluid-fluidInjector-request.pageState", pageState);
                            }


                        }
                    }


                    config.headers["Access-Control-Allow-Origin"] = "*";
                    if (ss.isSessionOpened()) {
                        config.headers['Authorization'] = ss.getSessionProperty(AUTHORIZATION);
                    }
                    console.debug("fluidInjector-request.config-altered", config);
                    return config;
                },
                "requestError": function (rejection) {
                    fls.loaded = true;
                    fls.enabled = true;
                    return q.reject(rejection).then(undefined, r.callError);
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
                    return q.reject(rejection).then(undefined, r.callError);
                }
            };
        }])
    .service("responseEvent", ["$location", "$rootScope", function (l, rs) {


        this.responses = [];

        this.addResponse = function (evt, statusCode, redirect, path) {
            this.responses.push({
                "evt": evt,
                "statusCode": statusCode,
                "redirect": redirect,
                "path": path
            });

        }

        this.callEvent = function (res) {
            angular.forEach(this.responses, function (response) {
                console.debug("fluid-responseEvent.response", response);
                if (response.statusCode === res.statusCode) {
                    if (response.evt) {
                        rs.$broadcast(response.evt, response.data, response.statusText);
                    } else if (response.redirect) {
                        l.path(response.path);
                    }

                }
            });
        };


        this.callError = function (rejection) {
            console.debug("fluid-responseEvent.rejection", rejection);
        };

        return this;

    }]);

/*Bootsrap Utilities*/
fluidComponents.directive("bootstrapViewport", ["$window", "$viewport", function (w, v) {
    return {
        restrict: "AE",
        replace: true,
        template: "<span class='hidden'><span class='fluid-view-lg'></span><span class='fluid-view-md'></span><span class='fluid-view-sm'></span><span class='fluid-view-xs'></span></span>",
        link: function (scope, element, attr) {

            if (element.find("span.fluid-view-lg").css("display") === 'block') {
                v.view = "lg";
            } else if (element.find("span.fluid-view-md").css("display") === 'block') {
                v.view = "md";
            } else if (element.find("span.fluid-view-sm").css("display") === 'block') {
                v.view = "sm";
            } else if (element.find("span.fluid-view-xs").css("display") === 'block') {
                v.view = "xs";
            }

            $(w).on("resize", function () {
                if (v) {
                    if (element.find("span.fluid-view-lg").css("display") === 'block') {
                        v.view = "lg";
                    } else if (element.find("span.fluid-view-md").css("display") === 'block') {
                        v.view = "md";
                    } else if (element.find("span.fluid-view-sm").css("display") === 'block') {
                        v.view = "sm";
                    } else if (element.find("span.fluid-view-xs").css("display") === 'block') {
                        v.view = "xs";
                    }
                }
            });
        }
    }
}]);
fluidComponents
    .directive("hidden25", ["$viewport", "fluidFrameService", "$window", function (v, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {

                if (scope.fluidPanel) {
                    if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                        if (scope.fluidPanel.task.size === 25) {
                            element.addClass("hideSize25");
                        } else {
                            element.removeClass("hideSize25");
                        }
                    } else {
                        element.removeClass("hideSize25");
                    }

                    if (scope.fluidPanel.task) {
                        scope.$watch(function (scope) {
                            if (scope.fluidPanel) {
                                return scope.fluidPanel.task.size;
                            }
                        }, function (value) {
                            if (scope.fluidPanel) {
                                if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                                    if (value === 25) {
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

                    $(w).on("resize", function () {
                        if (scope) {
                            if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                                if (scope.fluidPanel.task.size === 25) {
                                    element.addClass("hideSize25");
                                } else {
                                    element.removeClass("hideSize25");
                                }

                            } else {
                                element.removeClass("hideSize25");
                            }
                        }
                    });
                } else {
                    throw "Element must be a child of <fluid-panel>";
                }
            }
        }
    }])
    .directive("hidden50", ["$viewport", "fluidFrameService", "$window", function (v, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                if (scope.fluidPanel) {
                    if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                        if (scope.fluidPanel.task.size === 50) {
                            element.addClass("hideSize50");
                        } else {
                            element.removeClass("hideSize50");
                        }
                    } else {
                        element.removeClass("hideSize50");
                    }

                    if (scope.fluidPanel.task) {
                        scope.$watch(function (scope) {
                            if (scope.fluidPanel) {
                                return scope.fluidPanel.task.size;
                            }
                        }, function (value) {
                            if (scope.fluidPanel) {
                                if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                                    if (value === 50) {
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

                    $(w).on("resize", function () {
                        if (scope) {
                            if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                                if (scope.fluidPanel.task.size === 50) {
                                    element.addClass("hideSize50");
                                } else {
                                    element.removeClass("hideSize50");
                                }

                            } else {
                                element.removeClass("hideSize50");
                            }
                        }
                    });
                } else {
                    throw "Element must be a child of <fluid-panel>";
                }
            }
        }
    }])
    .directive("hidden75", ["$viewport", "fluidFrameService", "$window", function (v, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {

                if (scope.fluidPanel) {
                    if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                        if (scope.fluidPanel.task.size === 75) {
                            element.addClass("hideSize75");
                        } else {
                            element.removeClass("hideSize75");
                        }
                    } else {
                        element.removeClass("hideSize75");
                    }

                    if (scope.fluidPanel.task) {
                        scope.$watch(function (scope) {
                            if (scope.fluidPanel) {
                                return scope.fluidPanel.task.size;
                            }
                        }, function (value) {
                            if (scope.fluidPanel) {
                                if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                                    if (value === 75) {
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

                    $(w).on("resize", function () {
                        if (scope) {
                            if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                                if (scope.fluidPanel.task.size === 75) {
                                    element.addClass("hideSize75");
                                } else {
                                    element.removeClass("hideSize75");
                                }

                            } else {
                                element.removeClass("hideSize75");
                            }
                        }
                    });
                } else {
                    throw "Element must be a child of <fluid-panel>";
                }


            }
        }
    }])
    .directive("hidden100", ["$viewport", "fluidFrameService", "$window", function (v, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {


                if (scope.fluidPanel) {
                    if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                        if (scope.fluidPanel.task.size === 100) {
                            element.addClass("hideSize100");
                        } else {
                            element.removeClass("hideSize100");
                        }
                    } else {
                        element.removeClass("hideSize100");
                    }

                    if (scope.fluidPanel.task) {
                        scope.$watch(function (scope) {
                            if (scope.fluidPanel) {
                                return scope.fluidPanel.task.size;
                            }
                        }, function (value) {
                            if (scope.fluidPanel) {
                                if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                                    if (value === 100) {
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

                    $(w).on("resize", function () {
                        if (scope) {
                            if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
                                if (scope.fluidPanel.task.size === 100) {
                                    element.addClass("hideSize100");
                                } else {
                                    element.removeClass("hideSize100");
                                }

                            } else {
                                element.removeClass("hideSize100");
                            }
                        }
                    });
                } else {
                    throw "Element must be a child of <fluid-panel>";
                }


            }
        }
    }])
    .directive("hiddenFullscreenXs", ["$viewport", "fluidFrameService", "$window", function (v, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {

                if (scope.fluidPanel) {
                    if (v.is("xs") && scope.fluidPanel.frame.fullScreen) {
                        element.addClass("hideFullscreenXs");
                    } else {
                        element.removeClass("hideFullscreenXs");
                    }

                    $(w).on("resize", function () {
                        if (v.is("xs") && scope.fluidPanel.frame.fullScreen) {
                            element.addClass("hideFullscreenXs");
                        } else {
                            element.removeClass("hideFullscreenXs");
                        }

                    });
                } else {
                    throw "Element must be a child of <fluid-panel>";
                }


            }
        }
    }])
    .directive("hiddenFullscreenSm", ["$viewport", "fluidFrameService", "$window", function (v, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                if (scope.fluidPanel) {
                    if (v.is("sm") && scope.fluidPanel.frame.fullScreen) {
                        element.addClass("hideFullscreenSm");
                    } else {
                        element.removeClass("hideFullscreenSm");
                    }

                    $(w).on("resize", function () {

                        if (v.is("sm") && scope.fluidPanel.frame.fullScreen) {
                            element.addClass("hideFullscreenSm");
                        } else {
                            element.removeClass("hideFullscreenSm");
                        }

                    });
                } else {
                    throw "Element must be a child of <fluid-panel>";
                }
            }
        }
    }])
    .directive("hiddenFullscreenMd", ["$viewport", "fluidFrameService", "$window", function (v, f, w) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                if (scope.fluidPanel) {
                    if (v.is("md") && scope.fluidPanel.frame.fullScreen) {
                        element.addClass("hideFullscreenMd");
                    } else {
                        element.removeClass("hideFullscreenMd");
                    }

                    $(w).on("resize", function () {
                        if (v.is("md") && scope.fluidPanel.frame.fullScreen) {
                            element.addClass("hideFullscreenMd");
                        } else {
                            element.removeClass("hideFullscreenMd");
                        }

                    });
                } else {
                    throw "Element must be a child of <fluid-panel>";
                }
            }
        }
    }])
    .directive("hiddenFullscreenLg", ["$viewport", "fluidFrameService", "$window", function (v, f, w) {
        return {
            restrict: "AC",
            scope: true,
            link: function (scope, element, attr) {

                if (scope.fluidPanel) {
                    if (v.is("lg") && scope.fluidPanel.frame.fullScreen) {
                        element.addClass("hideFullscreenLg");
                    } else {
                        element.removeClass("hideFullscreenLg");
                    }


                    $(w).on("resize", function () {
                        if (v.is("lg") && scope.fluidPanel.frame.fullScreen) {
                            element.addClass("hideFullscreenLg");
                        } else {
                            element.removeClass("hideFullscreenLg");
                        }
                    });
                } else {
                    throw "Element must be a child of <fluid-panel>";
                }

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

                    scope.$watch(function () {
                        return attr.reduceHeight;
                    }, function (height) {
                        scope.reduceHeight = height;
                        fillHeight(element, w.height(), height);
                    });

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


/** TODO:
 ISSUES:
 1) Destroy FluidPanel when toggleFullscreen;
 2) Fix state when closing FluidPanel;
 3) Fix Page rendering
 **/
