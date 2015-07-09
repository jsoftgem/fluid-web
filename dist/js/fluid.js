/**Fluid Web v0.1.0
 * Created by Jerico de Guzman
 * October 2014**/
'use strict';

var fluidComponents = angular.module("fluid", ["oc.lazyLoad", "LocalStorageModule", "ngResource", "fluidTemplates", "fluidSession",
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
    .factory("fluidInjector", ["$q", "$rootScope", "sessionService", "fluidLoaderService", "responseEvent",
        function (q, rs, ss, fls, r) {

            return {
                "request": function (config) {
                    if (fls.enabled) {
                        fls.loaded = false;
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
                if (response.statusCode === res.statusCode) {
                    if (response.evt) {
                        rs.$broadcast(response.evt, response.data, response.statusText);
                    } else if (response.redirect) {
                        l.path(response.path);
                    }

                }
            });
        }

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
;/**
 * Created by jerico on 4/28/2015.
 */


function Task() {
    var task = {};

    task.id = undefined;

    task.glyph = undefined;

    task.title = undefined;

    task.active = undefined;

    task.size = undefined;

    task.pinned = undefined;

    task.locked = undefined;

    task.url = undefined;

    task.page = undefined;

    task.pages = undefined;

    return task;
}

function Control() {
    var control = {};
    control.id = undefined;
    control.glyph = undefined;
    control.label = undefined;
    control.disabled = undefined;
    control.action = undefined;
    control.visible = function () {
        return true
    };
    return control;
}

var eventInterceptorId = "event_interceptor_id_";
var goToEventID = "event_got_id_";
var EVENT_NOT_ALLOWED = "not_allowed_";
var AUTHORIZATION = "authorization";

function estimateHeight(height) {
    var _pc = window.innerWidth < 450 ? 55 : window.innerWidth < 768 ? 55 : window.innerWidth < 1200 ? 60 : 50;
    return height - _pc
}

function estimatedFrameHeight(height) {
    console.debug("estimatedFrameHeight.getHeadingHeight", getHeadingHeight());
    var _pc = window.innerWidth < 450 ? 60 : window.innerWidth < 768 ? 60 : window.innerWidth < 1200 ? 65 : 50;
    return height - _pc
}

//TODO: body height
function getHeadingHeight() {
    var height = 0;
    $("body").children().each(function () {
        if (!$(this).hasClass("frame-content")) {
            height += $(this).outerHeight();
        } else {
            return false;
        }
    });

    return height;
}

function generateTask(scope, t, f2) {
    console.debug("generateTask > scope.task.page", scope.task.page);
    scope.task.pageLoaded = false;
    if (scope.task.page === undefined || scope.task.page === null) {
        if (scope.task.pages) {
            var $page = getHomePageFromTaskPages(scope.task);
            scope.task.page = $page.page;
            scope.homeUrl = $page.page.get;
            scope.home = $page.page.name;
            scope.task.navPages = [$page.page];
            console.debug("page", scope.task.page);
        }
    } else {
        scope.homeUrl = scope.task.page.get;
        scope.task.page.param = scope.task.pageParam;
        var page = scope.task.page;

        if (!scope.task.page.isHome || scope.task.page.isHome === false) {
            if (scope.task.pages) {
                var $page = getHomePageFromTaskPages(scope.task);
                scope.home = $page.page.name;
                scope.task.navPages = [$page.page];
            }
        } else {
            scope.task.navPages = [page];
        }

        if (scope.task.page.param && scope.task.page.param !== "null") {
            scope.homeUrl = scope.task.page.get + scope.task.page.param;
            console.debug("homeUrl", scope.homeUrl);
        }

        if (scope.task.navPages.indexOf(page) > -1) {
            scope.currentPageIndex = getPageIndexFromPages(scope.task.page.name, scope.task.navPages).index;
        } else {
            scope.task.navPages.push(page);
            scope.currentPageIndex = scope.task.navPages.length - 1;
        }

        for (var i = 0; i < scope.toolbars.length; i++) {
            if (scope.toolbars[i].id === 'back') {
                scope.toolbars[i].disabled = !(scope.currentPageIndex > 0);
            }
            if (scope.toolbars[i].id === 'forward') {
                scope.toolbars[i].disabled = !(scope.currentPageIndex < scope.task.navPages.length - 1);
            }
        }
    }

    scope.userTask.fluidId = scope.task.fluidId;
    console.debug("new_task", scope.task);
    var loadGetFn = function () {
        /*pre-load*/
        if (scope.task.preLoaded === undefined || scope.task.preLoaded === false) {
            scope.task.preLoad();
            scope.task.preLoaded = true;
        }
        scope.loadGet();
        if (scope.task.preLoaded) {
            scope.task.load();
            scope.task.loaded = true;
        }
        scope.task.postLoad();

    };


    t(loadGetFn, 500);
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function getHomePageFromTaskPages(task) {
    var $page = {};

    angular.forEach(task.pages, function (page, key) {
        if (page.isHome) {
            this.page = page;
            this.index = key;
        }
    }, $page);

    return $page;
}

function getPageIndexFromTaskPages(name, task) {
    var $index = -1;
    angular.forEach(task.pages, function (page, key) {
        if (page.name === name) {
            this.index = key;
        }
    }, $index);

    return $index;
}

function getPageIndexFromPages(name, pages) {
    var $index = {index: -1};
    angular.forEach(pages, function (page, key) {
        if (page != null) {
            if (page.name === name) {
                this.index = key;
            }
        }

    }, $index);
    return $index;
}

function saveTaskSate(task, userTask, fluidHttpService, field) {
    if (task.generic === false) {
        if (task.id.indexOf("gen") === -1) {
            userTask.fluidTaskId = task.id.split("_")[0];
            userTask.fluidId = task.fluidId;
            return fluidHttpService.query({
                url: task.stateAjax.url + "?field=" + field,
                method: task.stateAjax.method,
                data: userTask
            }, task);
        }
    }
}

function autoSizePanel(task) {
    console.debug("autoSizePanel", task);
    var height = window.innerHeight;
    height = estimateHeight(height);

    var panel = $("#_id_fp_" + task.id + ".panel");
    var panelBody = $("#_id_fp_" + task.id + ".panel div.fluid-panel-content");
    panel.height(height);
    var headerHeight = panel.find("div.panel-heading").outerHeight();

    if (task.showToolBar) {
        headerHeight += panel.find("div.ndg-breadcrumb").outerHeight() + 13;
        panelBody.css("margin-top", "");
    } else {
        panelBody.css("margin-top", "2px");
    }

    headerHeight += 22;

    var bodyHeight = height - headerHeight;

    panelBody.css("height", bodyHeight, "important");

    panelBody.css("overflow-y", "auto");


    console.debug("autoSizePanel.bodyHeight", bodyHeight);


}

function getOffset(parent, offset, index) {
    var child = parent.children()[index];
    console.debug("fluidFrame-getOffset.parent", parent);
    console.debug("fluidFrame-getOffset.parent.children", parent.children);
    if (child) {
        console.debug("fluidFrame-getOffset.parent.child", child);
        if ($(child).hasClass("panel-collapse")) {
            index = 0;
            return getOffset($(child), offset, index);
        }
        else if ($(child).hasClass("panel-body")) {
            index = 0;
            return getOffset($(child), offset, index);
        }
        else if ($(child).attr("page-name") !== undefined) {

            console.debug("fluidFrame-getOffset.parent.child.result", offset);
            return offset;
        } else {
            index++;
            offset += $(child).innerHeight();
            console.debug("fluidFrame-getOffset.parent.child.offset", offset);
            return getOffset(parent, offset, index);
        }
    }
    else {
        return offset;
    }


}


function fillHeight(element, height, reducedHeight) {
    console.debug("fillHeight-element: ", element);
    console.debug("fiilHeight-height: ", height)
    console.debug("fiilHeight-reducedHeight: ", reducedHeight)
    var elemHeight = height;
    if (reducedHeight) {
        elemHeight -= reducedHeight;
    }
    console.debug("fiilHeight-elemHeight: ", elemHeight)
    element.css("height", elemHeight + "px");
}


function autoFullscreen(element, height, width) {
    var offset = getOffset(element, 0, 0);
    console.debug("fluidFrame-autoFullscreen.offset", offset);
    console.debug("fluidFrame-autoFullscreen.element", element);
    console.debug("fluidFrame-autoFullscreen.height", height);
    var pageHeight = (height - (offset > 0 ? (offset + 5) : 0));

    element.find(".fluid-page").ready(function () {
        element.find(".fluid-page").css("height", pageHeight + "px").css("overflow-y", "auto");
    });

}


function fixPageHeight(element) {
    var offset = getOffset(element, 0, 0);
    var maxHeight = element.parent().css("height");
    console.debug("fixPageHeight.offset", offset);
    console.debug("fixPageHeight.maxHeight", maxHeight);
    if (maxHeight) {
        var pageHeight = (maxHeight - (offset > 0 ? (offset + 5) : 0));
        element.find(".fluid-page").ready(function () {
            element.find(".fluid-page").css("height", pageHeight + "px").css("overflow-y", "auto");
        });
    }
}


function addItem(item, items, $index) {
    if (!$index) {
        $index = 0;
    }
    var con = items[$index];
    if (!con) {
        items.push(item);
    } else {
        if (con.id !== item.id) {
            $index++;
            return addItem(item, items, $index);
        }
    }
}


function filterPage(pages, $index) {

    if (!$index) {
        $index = 0;
    }
    var page = pages[$index];
    if (!page) {
        return;
    }
    if ((page.showOnList === undefined || page.showOnList) && !page.isHome) {
        $index++;
    } else {
        pages.splice($index, 1);
    }


    if ($index < pages.length) {
        return filterPage(pages, $index);
    } else {
        return pages;
    }
}


function clearObjects(arr, $index) {
    if (!$index) {
        $index = 0;
    }

    var obj = arr[$index];

    if (obj.clear) {
        obj.clear();

    }
    if ($index < arr.length) {
        $index++;
        return clearObjects(arr, $index);
    }

}

function LightenDarkenColor(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

}
function loadRunner(scope, element, runner, progress) {
    scope.startLoader();
    return runner.load(function (resolver) {
            runner.done = true;
            runner.inProgress = false;
            progress.inProgress = false;
            scope.endLoader();
            progress.complete(runner.name, resolver);
            if (runner.max) {
                if (scope.count >= runner.max) {
                    scope.count -= runner.max;
                }

                if (scope.max >= runner.max) {
                    scope.max -= runner.max;
                }

                if (scope.min >= runner.min) {
                    scope.min -= runner.min;
                }

                if (scope.count >= runner.max) {
                    scope.count -= runner.max;
                }

            }

        }, function (reason) {
            runner.cancelled = true;
            runner.inProgress = false;
            progress.inProgress = false;
            scope.endLoader();
            progress.cancel(runner.name, reason);
            if (runner.max) {
                if (scope.count > runner.max) {
                    scope.count -= runner.max;
                }

                if (scope.max > runner.max) {
                    scope.max -= runner.max;
                }

                if (scope.min > runner.min) {
                    scope.min -= runner.min;
                }
                if (scope.count >= runner.max) {
                    scope.count -= runner.max;
                }
            }
        },
        function (message, type, count) {
            var messageElement = element.find(".status");
            var textClass = "info";
            if (type === "info") {
                textClass = "text-info";
            } else if (type === "danger") {
                textClass = "text-danger";
            } else if (type === "success") {
                textClass = "text-success";
            } else if (type === "warning") {
                textClass = "text-warning";
            }

            var progressBar = element.find(".progress-bar");
            if (progressBar) {
                var now = progressBar.attr("aria-valuenow");
                progressBar.attr("aria-valuenow", now++);
            }


            if (runner.max && runner.max > 0 && count > 0) {
                progress.count += count;
                scope.count += count;
            }

            messageElement.addClass(textClass);
            messageElement.html(message);
        });
}
function loadPage(fluidPanel) {
    console.debug("util-loadPage.fluidPanel", fluidPanel);
    if (fluidPanel) {
        var progress = fluidPanel.progress;
        console.debug("util-loadPage.progress", progress);
        if (progress) {
            progress.run("loadPage", function (ok, cancel, notify) {
                console.debug("util-loadPage.progress-loadPage");
                var page = fluidPanel.currentPage();
                console.debug("util-loadPage.progress-loadPage.page", page);
                if (page) {
                    ok(page);
                } else {
                    cancel("Page not found.");
                }
            });
        }
    }

}


function initOption(option, page) {
    if (option) {
        var param = option.param;
        var url = option.url;
        var data = option.data;
        if (page.ajax === undefined) {
            page.ajax = {};
        }
        if (param) {
            page.ajax.param = param;
        }
        if (url) {
            page.ajax.url = url;
        }
        if (data) {
            page.ajax.data = data;
        }
    }
}


//handles document here
$(document).ready(function () {

    var infoSig = "fluidDocumentHandler";

    $(this).click(function (e) {
        $(".fluid-option").each(function (index, element) {
            var fluidOptionScope = angular.element($(element)).scope();
            if (fluidOptionScope) {
                var sourceId = $(e.target).attr("id");
                var elementSourceEvent = $(element).attr("source-event");
                if ($.contains(element, e.target)) {
                    return;
                }

                if (elementSourceEvent) {

                    var elementSource = $("[id='" + elementSourceEvent + "']");

                    var activeElementSource = elementSource.context.activeElement;

                    if (elementSource.find(e.target).length > 0) {
                        return;
                    }

                    if (elementSource.is(e.target)) {
                        return;
                    }

                    if (elementSourceEvent !== sourceId) {
                        console.debug(infoSig + ".fluidPanel", fluidOptionScope.fluidPanel);
                        var fluidPage = fluidOptionScope.fluidPanel.getPage(fluidOptionScope.fluidPanel.fluidBreadcrumb.currentPage());
                        console.debug(infoSig + ".fluidPage", fluidPage);
                        if (fluidPage.option.isOpen) {
                            fluidPage.option.close();
                            if (fluidPage.option.returnToPrevious) {
                                fluidPage.option.returnToPrevious();
                                if (!fluidPage.$scope().$$phase) {
                                    fluidPage.$scope().$apply();
                                }
                            }


                        }
                    }
                }


            }
        });
    });

});

;/**
 * Created by rickz_000 on 5/10/2015.
 */
angular.module("fluidBreadcrumb", [])
    .directive("fluidBreadcrumb", ["$templateCache", "FluidBreadcrumb", function (tc, FluidBreadcrumb) {
        return {
            restrict: "E",
            replace: true,
            template: tc.get("templates/fluid/fluidBreadcrumb.html"),
            scope: false,
            link: function (scope, element, attr) {
                scope.breadcrumb = new FluidBreadcrumb(scope.fluidPanel);
                console.debug("fluidBreadcrumb.breadcrumb", scope.breadcrumb);
                scope.collapse = function () {
                    if (scope.task.collapsed) {
                        scope.task.collapsed = false;
                        $("#_id_fp_mp_" + scope.task.fluidId + "_progress").collapse("toggle");
                    }
                };
                scope.close = function (breadcrumb, page, $index, $event) {

                }
            }
        }
    }])
    .factory("FluidBreadcrumb", [function () {
        var fluidBreadcrumb = function (fluidPanel) {
            if (fluidPanel.breadcrumbs[fluidPanel.id] != null) {
                return fluidPanel.breadcrumbs[fluidPanel.id];
            } else {
                this.$ = $("div#_id_fp_" + fluidPanel.id + " .fluid-breadcrumb");
                this.fluidId = fluidPanel.id;
                this.pages = [];
                this.current = 0;
                this.fluidPanel = fluidPanel;
                this.hasNext = function () {
                    return this.current < (this.pages.length - 1);
                }
                this.hasPrevious = function () {
                    return this.current > 0;
                }
                this.next = function () {
                    if (this.hasNext()) {
                        this.current++;
                        this.scrollToCurrent();
                    }
                }
                this.previous = function () {
                    if (this.hasPrevious()) {
                        this.current--;
                        this.scrollToCurrent();
                    }
                }
                this.addPage = function (page) {
                    if (this.pages.indexOf(page.name) > -1) {
                        this.current = this.pages.indexOf(page.name);
                    } else {
                        this.pages.push(page.name);
                        this.current = this.pages.indexOf(page.name);
                    }
                    this.scrollToCurrent();
                }
                this.scrollToCurrent = function () {
                    this.scrollTo(this.current);
                }
                this.scrollTo = function (index) {
                    console.debug("fluidBreadcrumb.scrollTo.index", index);
                    this.$.scrollTo(this.$.find("div:eq(" + index + ")"), 800);
                }
                this.currentPage = function () {
                    return this.pages[this.current];
                }
                this.close = function (page, $index, $event) {
                    this.pages.splice($index, 1);
                    if (this.current > 0) {
                        this.current -= 1;
                    }
                    console.debug("fluidBreadcrumb-FluidBreadcrumb-close.current", this.current);
                };
                this.open = function (page, $index, $event) {
                    this.current = $index;
                };
                this.getTitle = function (bread) {
                    if (this.fluidPanel) {
                        var page = this.fluidPanel.getPage(bread);
                        if (page) {
                            return page.title;
                        }
                    }
                };
                fluidPanel.breadcrumbs[fluidPanel.id] = this;

            }
        }
        return fluidBreadcrumb;
    }])
    .service("breadcrumbService", [function () {
        this.breadcrumbs = [];
        return this;
    }])
    .directive("fluidResizeBreadcrumb", ["$window", "FluidBreadcrumb", function ($w, FluidBreadcrumb) {
        return {
            restrict: "A",
            scope: false,
            link: function (scope, element, attr) {

                var w = angular.element($w);
                console.debug("fluidBreadcrumb-fluidResizeBreadcrumb.element", element);

                var parent = element.parent();

                console.debug("fluidBreadcrumb-fluidResizeBreadcrumb.parent", parent[0].clientWidth);
                console.debug("fluidBreadcrumb-fluidResizeBreadcrumb.fluidPanel.id", scope.fluidPanel.id);

                w.bind("resize", function () {
                    if (scope.fluidPanel && scope.fluidPanel.page && scope.fluidPanel.loaded) {
                        autoSizeBreadcrumb(element, parent, scope.fluidPanel.id);
                        var fluidBreadcrumb = new FluidBreadcrumb(scope.fluidPanel);
                        fluidBreadcrumb.scrollToCurrent();
                    }
                });

                scope.$watch(function (scope) {
                    return scope.fluidPanel.page;
                }, function (page) {
                    console.debug("fluidResizeBreadcrumb$watch.fluidPanel.page", page);
                    if (page && scope.fluidPanel.loaded) {
                        autoSizeBreadcrumb(element, parent, scope.fluidPanel.id);
                    }
                })

                //TODO: task size event for breadcrumb
            }
        }
    }]);

function autoSizeBreadcrumb(element, parent, id) {
    var offsetWidth = 0;
    var lastIndex = parent.children().length - 1;

    angular.forEach(parent.children(), function (value, index) {
        var width = parent.innerWidth();
        if (!$(value).hasClass('fluid-breadcrumb')) {
            console.debug("fluidBreadcrumb-autoSizeBreadcrumb.value", value);
            offsetWidth += $(value).width();
            console.debug("fluidBreadcrumb-autoSizeBreadcrumb.value.width", $(value).width());
        }
        if (index === lastIndex) {
            console.debug("fluidBreadcrumb-autoSizeBreadcrumb.offsetWidth", offsetWidth);
            width -= offsetWidth + 20;
            this.width(width);
            console.debug("fluidBreadcrumb-autoSizeBreadcrumb.width", width);
        }
    }, element);
};/**
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

    }]);;/**
 * Created by jerico on 4/28/2015.
 * Fluid Frame Version 2.0 ff features:
 *
 * ** TODO: State Manager
 *
 * ** Detachable Frames
 *
 * ** Different Workspace
 *
 * ** Detachable Task
 *
 * ** Split Screen
 */

var frameKey = "frame_";
angular.module("fluidFrame", ["fluidHttp", "fluidTask", "fluidSession", "fluidProgress"])
    .directive("fluidFrame", ["$templateCache", "$window", "fluidFrameService", "$viewport", "FluidProgress", "$compile", function (tc, window, FrameService, v, FluidProgress, c) {
        return {
            restrict: "E",
            replace: true,
            scope: {name: "@", fullScreen: "=", showWorkspace: "="},
            link: function (scope, element) {
                var _t_nf = "templates/fluid/fluidFrameNF.html";
                var _t_f = "templates/fluid/fluidFrameF.html";

                scope.renderFrame = function () {
                    console.debug("fluidFrame-renderFrame");

                }

                if (!scope.name) {
                    throw "'name' attribute is required.";
                } else {

                    scope._t = _t_nf;

                    element.html("<bootstrap-viewport></bootstrap-viewport> <div fluid-progress id='_id_mf_fp_" + scope.name + "'><ng-include src='_t'></ng-include></div>");

                    c(element.contents())(scope);

                    console.debug("fluidFrame-init");


                    scope.progress = new FluidProgress({
                        id: "_id_mf_fp_" + scope.name
                    });

                    console.debug("fluidFrame.progress", scope.progress);

                    scope.progress.run("loadFrame", function (ok, cancel, notify) {
                        scope.frame = new FrameService(scope.name);
                        ok(scope.frame);
                        console.debug("fluidFrame.created", scope.frame);
                    });

                    scope.progress.onComplete("loadFrame", function (frame) {
                        scope.renderFrame();
                    });

                }


                $(window).on("resize", function () {
                    console.debug("fluid-frame.viewport", v);
                    scope.setViewport();
                });
                scope.setViewport = function () {
                }
                scope.setViewport();


            },
            template: tc.get("templates/fluid/fluidFrame.html")
        }
    }])
    .directive("fluidFullscreenHeight", ["$window", function ($w) {
        return {
            scope: false,
            restrict: "A",
            link: function (scope, element, attr) {

                var w = angular.element($w);
                if (attr.offset) {
                    scope.offset = attr.offset;
                }
                w.bind("resize", function () {
                    if (scope.frame.fullScreen) {
                        var frameElement = scope.frame.$();
                        var maxHeight = frameElement.css("height");
                        if (maxHeight) {
                            console.debug("fluidPanel.fullScreen.resize.maxHeight", maxHeight);
                            console.debug("fluidPanel.fullScreen.resize.innerHeight", frameElement.innerHeight());
                            autoFullscreen(element, maxHeight.replace("px", ""), frameElement.innerWidth());
                        }
                    }
                });
            }
        }
    }])
    .service("fluidFrameHandler", ["$timeout", function (t) {
        this.frames = [];

        var frames = this.frames;

        function check() {
            console.debug("fluidFrame-fluidFrameHandler.frames", frames);
            t(check, 1000);
        }

        return this;
    }])
    .factory("fluidFrameService", ["Frame", "fluidTaskService", "FluidTask", "FluidProgress", function (Frame, taskService, FluidTask, FluidProgress) {
        var frameService = function (name) {
            var frame = new Frame(name);

            frame.openTask = function (taskName, page, workspace, onLoad) {
                if (workspace) {

                }
                taskService.findTaskByName(taskName)
                    .then(function (task) {
                        var index = frame.tasks.length;
                        console.debug("fluidFrame-fluidFrameService.task", task);
                        task.fluidId = name + "_" + task.id + "_" + index;

                        var fluidTask = new FluidTask(task);
                        fluidTask.frame = frame.name;
                        fluidTask.index = index;
                        fluidTask.page = page;
                        if (onLoad) {
                            fluidTask.onLoad = onLoad;
                        }
                        fluidTask.ok = function () {
                        }
                        fluidTask.failed = function () {
                            frame.tasks.splice(index, 1);
                        }
                        frame.tasks.push(fluidTask);
                    });
            }
            frame.removeTask = function (task, workspace) {
                console.debug("fluidFrame-fluidFrameService.removeTask.task", task);
                angular.forEach(this.tasks, function (tsk, $index) {
                    if (tsk.fluidId === task.fluidId) {
                        this.tasks.splice($index, 1);
                    }
                }, this);
            }
            frame.getFluidTask = function (fluidId) {
                var filteredTask = {};
                angular.forEach(function (task, $index) {
                    if (task.fluidId === fluidId) {
                        this.task = task;
                    }
                }, filteredTask);

                return filteredTask.task;
            }
            frame.$ = function () {
                return $(".fluid-frame[name='" + frame.name + "']");
            }
            frame.progress = new FluidProgress({
                id: "_id_mf_fp_" + name
            });
            frame.toggleFullscreen = function (panel, task) {
                frame.progress.run("toggleFullscreen_" + task.fluidId, function (ok, cancel, notify) {
                    frame.fullScreen = !frame.fullScreen;
                    console.debug("fluidFrameService-toggleFullscreen.fullScreen", frame.fullScreen);
                    if (frame.fullScreen) {
                        frame.task = task;
                    } else {
                        frame.task = undefined;
                    }
                    ok(frame.fullScreen);
                });
            }
            frame.switchTo = function (task) {
                frame.progress.run("switchTask_" + task.fluidId, function (ok, cancel, notify) {
                    console.debug("fluidFrameService-switchTask.task", task);
                    frame.task = task;
                    ok(task);
                });
            }
            frame.closeTask = function (task, workspace) {
                frame.progress.run("closeTask_" + task.fluidId, function (ok, cancel, notify) {
                    if (frame.fullScreen) {
                        frame.fullScreen = false;
                        frame.task = undefined;
                    }
                    frame.removeTask(task, workspace);
                    ok(task);
                });
            }
            frame.clearPanel = function (id) {
                if (this.fluidPanel) {
                    var fluidPanel = this.fluidPanel[id];
                    if (fluidPanel) {
                        fluidPanel.clear();
                    }
                    this.fluidPanel[id] = null;
                }

            }
            return frame;
        }
        return frameService;

    }])
    .provider("Frame", function () {
        this.$get = ["$timeout", "fluidFrameHandler", "fluidStateService", function (t, fh, fts) {
            var frame = function Frame(name) {
                if (name) {
                    var key = frameKey + name;
                    if (fh.frames[key] != null) {
                        return fh.frames[key];
                    } else {
                        this.name = name;
                        this.fullScreen = false;
                        this.task = undefined;
                        this.tasks = [];
                        fh.frames[key] = this;
                    }
                }
            };
            return frame;
        }];
    });

;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidHttp", ["fluidSession"])
    .service("fluidHttpService", ["$rootScope", "$http", "fluidLoaderService", "$q", "$timeout", "sessionService", function (rs, h, fl, q, t, ss) {
        this.httpSerialKey = new Date().getTime();
        this.post = function (url, data, task) {
            task.loaded = false;
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }
            var headers = {"fluid-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};
            if (task.currentPage) {
                headers.method = "post";
                headers.fluidPage = task.currentPage;
            }
            if (data === undefined) {
                promise = h({
                    method: "post",
                    url: url,
                    headers: headers
                });


                promise.success(function (config) {
                    //   $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    //$("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });


                promise.then(function () {
                    task.loaded = true;
                    // $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                return promise;
            }
            promise = h({
                method: "post",
                url: url,
                data: data,
                headers: headers
            });
            promise.success(function (config) {
                this.httpSerialKey = new Date().getTime();
            });
            promise.error(function (data, status, headers, config) {
                //  $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED");
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
            });

            return promise;
        };
        this.postGlobal = function (url, data) {

            var promise = null;
            if (this.host) {
                url = this.host + url;
            }


            if (data === undefined) {
                promise = h({
                    method: "post",
                    url: url
                });

                return promise;
            }

            promise = h({
                method: "post",
                url: url,
                data: data
            });

            return promise;
        };
        this.put = function (url, data, task) {
            task.loaded = false;
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }

            var headers = {"fluid-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};

            if (task.currentPage) {
                headers.method = "put";
                headers.fluidPage = task.currentPage;
            }

            if (data === undefined) {
                promise = h({
                    method: "put",
                    url: url,
                    headers: headers
                });

                promise.success(function (config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });

                return promise;
            }
            promise = h({
                method: "put",
                url: url,
                data: data,
                headers: headers
            });

            promise.success(function (config) {
                this.httpSerialKey = new Date().getTime();
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
                // $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });


            return promise;
        };
        this.putGlobal = function (url, data) {
            var promise = null;
            if (this.host) {
                url = this.host + url;
            }

            var headers = {"Content-type": "application/json"};


            if (data === undefined) {
                promise = h({
                    method: "put",
                    url: url,
                    headers: headers
                });

                promise.error(function (data, status, headers, config) {
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    }
                });

                return promise;
            }

            promise = h({
                method: "put",
                url: url,
                data: data,
                headers: headers
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                }
                task.loaded = true;
            });

            return promise;
        };
        this.getLocal = function (url) {
            if (this.host) {
                url = this.host + url;
            }
            var promise = h({
                method: "get",
                url: url
            });
            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED", data.msg);
                }
            });

            return promise;
        };
        this.getGlobal = function (url, progress, cache) {

            fl.enabled = progress;

            if (this.host) {
                url = this.host + url;
            }

            var promise = h({
                method: "get",
                url: url
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast("NOT_ALLOWED", data.msg);
                }
            });

            return promise;
        };
        this.get = function (url, task) {

            task.loaded = false;

            if (this.host) {
                url = this.host + url;
            }
            var headers = {
                "Content-type": "application/json"
            };

            if (task.currentPage) {
                headers.method = "get";
                headers.fluidPage = task.currentPage;
            }


            var key = url + this.httpSerialKey;

            var sessionValue = ss.getSessionProperty(key);

            console.debug("fluid-http-server-cache-session-value", sessionValue);

            var promise = h({
                method: "get",
                url: url,
                headers: headers
            });

            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });

            promise.then(function () {
                task.loaded = true;
            });

            promise.success(function (data, status, headers, config, statusText) {
                var response = {};
                response.data = data;
                response.status = status;
                response.headers = headers;
                response.config = config;
                response.statusText = statusText;
                ss.addSessionProperty(key, response);
                console.debug("fluid-http-server-new-session-key", key);
                console.debug("fluid-http-server-new-session-value", data);
            });

            return promise;


        };
        this.delete = function (url, task) {
            task.loaded = false;
            if (this.host) {
                url = this.host + url;
            }
            var headers = {"fluid-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};

            if (task.currentPage) {
                headers.method = "delete";
                headers.fluidPage = task.currentPage;
            }
            var promise = null;

            promise = h({
                method: "delete",
                url: url,
                headers: headers
            });

            promise.success(function (config) {
                //   $("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            promise.error(function (data, status, headers, config) {
                //  $("#_id_fpb_" + task.id).loadingOverlay("remove");
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
                task.loaded = true;
            });

            promise.then(function () {
                task.loaded = true;
                //$("#_id_fpb_" + task.id).loadingOverlay("remove");
            });

            return promise;
        };
        this.updateResource = function (url, data, task) {
            var headers = {"fluid-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};

            if (task.currentPage) {
                headers.method = "get";
                headers.fluidPage = task.currentPage;
            }
            console.log(url);
            var promise = null;
            if (data === undefined) {
                promise = h({
                    method: "get",
                    url: url,
                    headers: headers
                });

                promise.success(function (config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                });

                promise.error(function (data, status, headers, config) {
                    $("#_id_fpb_" + task.id).loadingOverlay("remove");
                    if (status === 401) {
                        rs.$broadcast("NOT_AUTHENTICATED", data.msg);
                    } else if (status === 403) {
                        rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                    }
                });

                return promise;
            }
            promise = h({
                method: "get",
                url: url,
                data: data,
                headers: headers
            });

            promise.success(function (config) {
                task.loaded = true;
            });

            promise.error(function (data, status, headers, config) {
                task.loaded = true;
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });


            promise.then(function () {
                task.loaded = true;
            });

            return promise;
        }
        this.headers = function (task) {
            return {"fluid-container-id": "_id_fpb_" + task.id, "Content-type": "application/json"};
        }
        this.query = function (query, task) {
            if (task) {
                task.loaded = false;
            }
            var promise = h(query);
            promise.error(function (data, status, headers, config) {
                if (task) {
                    task.loaded = true;
                }
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });
            promise.then(function () {
                if (task) {
                    task.loaded = true;
                }
            });


            return promise;
        }

        this.queryLocal = function (query) {
            var promise = h(query);
            promise.error(function (data, status, headers, config) {
                if (status === 401) {
                    rs.$broadcast("NOT_AUTHENTICATED");
                } else if (status === 403) {
                    rs.$broadcast(EVENT_NOT_ALLOWED + task.id, data.msg);
                }
            });
            return promise;
        }

        return this;
    }])
    .service("fluidLoaderService", [function () {
        this.loaded = true;
        this.enabled = true;
        return this;
    }]);;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidMessage", ["fluidOption"])
    .service("fluidMessageService", ["$timeout", function (t) {
        var fluidMessageService = {};

        fluidMessageService.duration = 1000;

        fluidMessageService.info = function (id, message, duration) {
            fluidMessageService.id = id;
            fluidMessageService.message = message;
            fluidMessageService.alertType = "alert alert-info";
            fluidMessageService.duration = duration;
            return fluidMessageService;
        };

        fluidMessageService.warning = function (id, message, duration) {
            fluidMessageService.id = id;
            fluidMessageService.message = message;
            fluidMessageService.alertType = "alert alert-warning";
            fluidMessageService.duration = duration;
            return fluidMessageService;
        };

        fluidMessageService.danger = function (id, message, duration) {
            fluidMessageService.id = id;
            fluidMessageService.message = message;
            fluidMessageService.alertType = "alert alert-danger";
            fluidMessageService.duration = duration;
            return fluidMessageService;
        };

        fluidMessageService.success = function (id, message, duration) {
            fluidMessageService.id = id;
            fluidMessageService.message = message;
            fluidMessageService.alertType = "alert alert-success";
            fluidMessageService.duration = duration;
            return fluidMessageService;
        };

        fluidMessageService.open = function () {
            var messageId = "#" + fluidMessageService.id;

            var alerts = $(messageId).find("div[fluid-msg]").get();

            var index = 0;
            if (alerts) {
                index = alerts.length;
            }

            var alertContainer = $(messageId).get();
            var alert = $("<div>").attr("fluid-msg", index)/*.addClass("animated pulse anim-dur")*/.addClass(fluidMessageService.alertType).appendTo(alertContainer).get();

            $("<button>").attr("type", "button").addClass("close icon-cross").attr("data-dismiss", "alert").appendTo(alert).get();

            $("<span>").html(fluidMessageService.message).appendTo(alert);

            t(function () {
                $(alert).remove();
            }, fluidMessageService.duration);
        };

        fluidMessageService.close = function (messageId) {
            $(messageId).find("p").html("");
            $(messageId).removeClass(fluidMessageService.alertType);
            $(messageId).alert('close');
        };

        return fluidMessageService;
    }])
    .factory("FluidMessage", ["$timeout", "FluidOption", function (t, FluidOption) {

        var fluidMessage = function (fluidPanel, option) {
            this.duration = option.duration;
            this.template = option.template;
            this.fluidId = fluidPanel.id;
            this.icon = "fa fa-info";
            this.message = "";
            var option = new FluidOption(fluidPanel);
            this.info = function (message) {
                this.icon = "fa fa-info";
                this.message = message;
                option.info();
                return this;
            }

            this.success = function (message) {
                this.icon = "fa fa-check";
                this.message = message;
                option.success();
                return this;
            }

            this.danger = function (message) {
                this.icon = "fa fa-exclamation";
                this.message = message;
                option.danger();
                return this;
            }
            this.warning = function (message) {
                this.icon = "fa fa-exclamation-triangle";
                this.message = message;
                option.warning();
                return this;
            }
            this.open = function ($event) {
                fluidPanel.$scope.fluidMessage = this;
                fluidPanel.frame.$().scrollTop(0);
                option.open(this.template, $event.currentTarget);
                t(function () {
                    /* option.close();*/
                }, this.duration);
            }


        }


        return fluidMessage;


    }]);;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidOption", [])
    .directive("fluidOption", ["$templateCache", "fluidOptionService", "$window", function (tc, fos, w) {
        return {
            restrict: "AE",
            scope: false,
            replace: true,
            transclude: true,
            template: tc.get("templates/fluid/fluidOption.html"),
            link: function (scope, element, attr) {
                scope.close = function () {
                    fos.closeOption(element.attr("id"));
                }
            }
        }
    }])
    .directive("fluidOptionTemplate", ["$templateCache", function (tc) {
        return {
            restrict: "E",
            scope: {scope: "@"},//@Param scope {'task', 'page', 'new'}
            transclude: true,
            link: function (s, element, attr) {

                if (!s.scope) {
                    s.scope = "task";
                }

                if (!attr.id) {
                    throw "fluidOptionTemplate ID is required.";
                }
                var templateId = attr.id;
                console.debug("fluidOptionTemplate.templateId", templateId);
                tc.put(templateId, element.html());
            },
            replace: true,
            template: "<div ng-transclude style='display: none; position: absolute; height: 0px;/*width: 0px;*/padding: 0;margin: 0'></div>"
        }
    }])
    .factory("FluidOption", ["fluidOptionService", "$compile", "$templateCache", function (fos, c, tc) {
        var fluidOption = function (fluidPanel) {
            if (fos.fluidOptions[fluidPanel.id] != null) {
                fos.fluidOptions[fluidPanel.id].$().removeClass("bg-info").removeClass("bg-warning").removeClass("bg-success").removeClass("bg-danger");
                return fos.fluidOptions[fluidPanel.id];
            } else {
                this.fluidId = fluidPanel.id;
                this.$ = function () {
                    return $("#fluid_option_" + this.fluidId);
                }
                this.open = function (template, source, page) {
                    console.debug("FluidOption-openOption-source", source);
                    var templateId = template /*+ "_" + this.fluidId*/;
                    var fluidOption = this.$();
                    console.debug("fluidOption-openOption.option", fluidOption);
                    var fluidScope = angular.element(fluidOption).scope();
                    var fluidTemplate = fluidOption.find(".fluid-option-template");
                    var fluidBottom = fluidOption.find(".fluid-option-bottom");

                    if (source) {
                        var sourceID = $(source).attr("id");
                        console.debug("FluidOption-openOption-pre-sourceID", sourceID);
                        if (!sourceID) {
                            var eventSourceCount = $("[id*='_event_source_id']").length;
                            sourceID = fluidOption.attr("id") + "_event_source_id_" + eventSourceCount;
                            $(source).attr("id", sourceID);
                        } else {
                            var eventSourceCount = $("[id*='_event_source_id']").length;
                            sourceID = "event_source_id_" + eventSourceCount;
                            $(source).attr("id", sourceID);
                        }

                        fluidOption.attr("source-event", sourceID);
                    }

                    console.debug("FluidOption-openOption-sourceID", sourceID);
                    var parentHeight = fluidPanel.$().innerHeight();
                    console.debug("FluidOption-openOption.parentHeight", parentHeight);
                    fluidOption.css("max-height", parentHeight);
                    fluidTemplate.css("max-height", parentHeight - 15);
                    fluidBottom.removeClass("hidden")
                    console.debug("FluidOption-openOption.templateId", templateId);
                    var html = tc.get(templateId);
                    console.debug("FluidOption-openOption.html", html);
                    if (page) {
                        console.debug("fluidOption-FluidOption.page", page);
                        console.debug("fluidOption-FluidOption.pageScope", page.$scope());
                        c(fluidTemplate.html(html))(page.$scope());
                    } else {
                        c(fluidTemplate.html(html))(fluidPanel.$scope());
                    }
                    this.isOpen = true;
                }
                this.close = function () {
                    var fluidOption = $("#fluid_option_" + this.fluidId);
                    var fluidTemplate = fluidOption.find(".fluid-option-template");
                    var fluidBottom = fluidOption.find(".fluid-option-bottom");
                    fluidOption.css("max-height", 0);
                    fluidTemplate.css("max-height", 0);
                    fluidOption.removeAttr("source-event");
                    fluidBottom.addClass("hidden");
                    this.isOpen = false;
                }
                this.info = function () {
                    this.$().addClass("bg-info");
                    return this;
                }
                this.danger = function () {
                    this.$().addClass("bg-danger");
                    return this;
                }
                this.success = function () {
                    this.$().addClass("bg-success");
                    return this;
                }
                this.warning = function () {
                    this.$().addClass("bg-warning");
                    return this;
                }
                this.isOpen = false;

                this.isCancelled = false;

                this.putTemplate = function (name, template) {
                    tc.put(name, template);
                }

                fos.fluidOptions[fluidPanel.id] = this;
            }
        };

        return fluidOption;
    }])
    .service("fluidOptionService", ["$compile", "$templateCache", "$timeout", function (c, tc, t) {
        this.fluidOptions = [];
        this.clear = function (id) {
            this.fluidOptions[id] = undefined;
        }
        this.openOption = function (optionId, template, source) {
            console.debug("fluidOptionService-openOption-source", source);
            var fluidOption = $("#" + optionId);
            var content = $("#" + template);
            var fluidScope = angular.element(fluidOption).scope();
            var fluidTemplate = fluidOption.find(".fluid-option-template");
            var fluidBottom = fluidOption.find(".fluid-option-bottom");
            var contentScope = angular.element(content).scope();
            var sourceID = $(source).attr("id");
            console.debug("fluidOptionService-openOption-pre-sourceID", sourceID);
            if (!sourceID) {
                var eventSourceCount = $("[id*='_event_source_id']").length;
                sourceID = fluidOption.attr("id") + "_event_source_id_" + eventSourceCount;
                $(source).attr("id", sourceID);
            } else {
                var eventSourceCount = $("[id*='_event_source_id']").length;
                sourceID = "event_source_id_" + eventSourceCount;
                $(source).attr("id", sourceID);
            }
            console.debug("fluidOptionService-openOption-sourceID", sourceID);
            var parentHeight = fluidScope.parentHeight < 50 ? 60 : fluidScope.parentHeight;
            fluidOption.css("max-height", parentHeight);
            fluidTemplate.css("max-height", parentHeight - 10);
            fluidOption.attr("source-event", sourceID);
            fluidBottom.removeClass("hidden")
            if (contentScope) {
                c(fluidTemplate.html(content.html()))(contentScope);
            } else {
                var page = fluidOption.parent().find(".fluid-page");
                page.ready(function () {
                    var pageScope = angular.element(page).scope();
                    console.debug("fluidOption-fluidOptionService.page", page);
                    console.debug("fluidOption-fluidOptionService.pageScope", pageScope);
                    c(fluidTemplate.html(content.html()))(pageScope);
                });
            }
        }
        this.closeOption = function (optionId) {
            var fluidOption = $("#" + optionId);
            var fluidTemplate = fluidOption.find(".fluid-option-template");
            var fluidBottom = fluidOption.find(".fluid-option-bottom");
            fluidOption.css("min-height", undefined);
            fluidOption.css("max-height", 0);
            fluidTemplate.css("max-height", 0);
            fluidOption.removeAttr("source-event");
            fluidBottom.addClass("hidden");
        }

        var fluidOptions = this.fluidOptions;

        function check() {
            console.debug("fluidOption-fluidOptionService.fluidOptions", fluidOptions);
            t(check, 1000);
        }
    }]);
;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPage", ["fluidHttp", "fluidOption", "fluidPanel"])
    .directive("fluidPage", ["$templateCache", "fluidPageService", "FluidPage", "$compile", "FluidBreadcrumb", "FluidOption", "FluidPanel",
        function (tc, fps, FluidPage, c, FluidBreadcrumb, FluidOption, FluidPanel) {
            return {
                restrict: "E",
                scope: {fluidPanel: "="},
                template: tc.get("templates/fluid/fluidPage.html"),
                link: {
                    pre: function (scope) {
                        scope.fluidPageService = fps;
                        scope.loadPage = function (newPage) {
                            var pageElement = $("#" + scope.fluidPanel.getElementFlowId("_id_fp_p"));
                            console.debug("fluidPage-loadPage.page", newPage);
                            console.debug("fluidPage-loadPage.fluidPanel", scope.fluidPanel);
                            scope.fluidPage = newPage;
                            if (scope.fluidPage.ajax) {
                                fps.loadAjax(newPage)
                                    .then(function (data) {
                                        console.debug("fluidPage-loadPage.data", data);
                                        scope.data = data;
                                        pageElement.html("<ng-include class='page' src='fluidPageService.render(fluidPage)' onload='onLoad()'></ng-include>");
                                        pageElement.attr("page-name", newPage.name);
                                        c(pageElement.contents())(scope);
                                        console.debug("fluidPage-loadPage.loaded-page", newPage);
                                        scope.loadFrameAdjustment();
                                    });
                            } else {
                                pageElement.html("<ng-include class='page' src='fluidPageService.render(fluidPage)' onload='onLoad()'></ng-include>");
                                pageElement.attr("page-name", newPage.name);
                                c(pageElement.contents())(scope);
                                console.debug("fluidPage-loadPage.loaded-page", newPage);
                                scope.loadFrameAdjustment();
                            }
                        };

                        scope.loadFrameAdjustment = function () {
                            if (scope.fluidPanel.frame.fullScreen) {
                                scope.fluidPanel.frame.$().scrollTop(0);
                                var maxHeight = scope.fluidPanel.frame.$().css("height");
                                console.debug("fluidPage.fullScreen.maxHeight", maxHeight);
                                console.debug("fluidPage.fullScreen.innerHeight", scope.fluidPanel.frame.$().innerHeight());
                                autoFullscreen(scope.fluidPanel.$(), maxHeight.replace("px", ""), scope.fluidPanel.frame.$().innerWidth());
                            } else {
                                scope.fluidPanel.frame.$().find(".fluid-page").css("height", "").css("overflow-y", "");
                            }
                        }
                    },
                    post: function (scope, element) {
                        //TODO: page onLeave handling


                        if (scope.fluidPanel) {

                            scope.fluidPanel.frame.progress.onComplete(scope.fluidPanel.getElementFlowId("toggleFullscreen"), function () {
                                console.debug("fluidPage.fluidPanel.frame.progress.onComplete-toggleFullscreen", scope.fluidPanel.currentPage());
                                var page = scope.fluidPanel.currentPage();
                                if (page) {
                                    scope.loadPage(page);
                                }

                            });
                            scope.fluidPanel.frame.progress.onComplete(scope.fluidPanel.getElementFlowId("closeTask"), function () {
                                console.debug("fluidPage.fluidPanel.frame.progress.onComplete-closeTask", scope.fluidPanel.currentPage());
                                var page = scope.fluidPanel.currentPage();
                                if (page) {
                                    scope.loadPage(page);
                                }

                            });
                            scope.fluidPanel.progress.onComplete("loadPage", function (page) {
                                console.debug("fluidPage.fluidPanel.progress.onComplete-loadPage", page);
                                scope.loadPage(page);
                            });
                        }

                        scope.onLoad = function () {
                            console.debug("fluidPage-page-onload.fluidId", scope.fluidPanel.id);
                            scope.fluidPage.fluidId = scope.fluidPanel.id;
                            scope.fluidPage.$ = function () {
                                return $("#" + element.attr("id"));
                            };
                            scope.fluidPage.$scope = function () {
                                return scope;
                            };
                            console.debug("fluidPage-page-onload.$", scope.fluidPage.$());
                            scope.fluidPage.option = new FluidOption(scope.fluidPanel);
                            scope.fluidPage.loaded = false;
                            //TODO: page onLoad error handling

                            scope.fluidPage.load(function () {
                                scope.fluidPage.loaded = true;
                            }, function () {
                                scope.fluidPage.loaded = false;
                                scope.fluidPage.onClose = function (ok, cancel) {
                                    return ok();
                                };
                                element.html("");
                                c(element.contents())(scope);
                            });
                        }
                    }
                },
                replace: true
            }
        }])
    .factory("FluidPage", ["fluidPageService", "$resource", "$q", "$timeout", "$rootScope", function (fps, r, q, t, rs) {
        var fluidPage = function (page) {


            /*
             TODO: v 0.2.0 url page
             if(page.url){

             }else{

             }
             */
            console.debug("FluidPage-FluidPage.page", page);
            if (page.ajax) {
                if (page.ajax.url) {
                    if (!page.actions) {
                        page.actions = [];
                    }
                    if (!page.ajax.param) {
                        page.ajax.param = {};
                    }
                    this.resource = r(page.ajax.url, page.ajax.param, page.actions);

                } else {
                    throw "Page ajax.url is required!";
                }
            }
            this.isHome = page.isHome;
            this.name = page.name;
            this.id = page.id;
            this.title = page.title;
            this.static = page.static;
            this.html = page.html;
            this.home = page.home;
            this.ajax = page.ajax;
            /*
             TODO: create page transition
             if (page.animate) {
             this.animate = {};
             this.animate.previous = page.animate.previous ? page.animate.previous : 'slideOutRight';
             this.animate.next = page.animate.next ? page.animate.next : 'slideOutLeft';
             this.animate.enterPrevious = page.animate.enterPrevious ? page.animate.enterPrevious : 'slideInLeft';
             this.animate.enterNext = page.animate.enterNext ? page.animate.enterNext : 'slideInRight';
             this.animate.enter = page.animate.enter ? page.animate.enter : 'slideInLeft';
             this.animate.leave = page.animate.leave ? page.animate.leave : 'slideOutRight';
             } else {
             this.animate = {};
             this.animate.previous = 'slideOutRight';
             this.animate.next = 'slideOutLeft';
             this.animate.enterPrevious = 'slideInLeft';
             this.animate.enterNext = 'slideInRight';
             this.animate.enter = 'slideInLeft';
             this.animate.leave = 'slideOutRight';
             }*/
            this.refresh = function (proceed, cancel, $event) {
                var page = this;
                this.onRefresh(function () {
                    console.debug("fluid-page-FluidPage-onRefresh.proceed", proceed);
                    page.isRefreshed = true;
                    proceed(page);
                    if (page.option) {
                        page.option.isCancelled = false;
                        page.option.close();
                    }
                }, function () {
                    cancel();
                    if (page.option) {
                        page.option.isCancelled = true;
                        page.option.close();
                    }
                }, $event);
            };
            this.close = function (ok, cancel, $event) {
                var page = this;
                var pageElement = page.$();
                if (pageElement) {
                    var panelBody = pageElement.parent();
                    if (panelBody) {
                        var collapsePanel = panelBody.parent();
                        if (collapsePanel && !collapsePanel.hasClass("in")) {
                            collapsePanel.collapse("show");
                        }
                    }
                }

                this.onClose(function () {
                    ok();
                    if (page.option) {
                        page.option.isCancelled = false;
                        page.option.close();
                    }
                    page.onDestroy();
                }, function () {
                    cancel();
                    if (page.option) {
                        page.option.isCancelled = true;
                        page.option.close();
                    }
                }, $event);
            };
            this.change = function (proceed, cancel, $event) {
                var page = this;
                this.onChange(function () {
                    proceed();
                    if (page.option) {
                        page.option.isCancelled = false;
                        page.option.close();
                    }
                }, function () {
                    cancel();
                    if (page.option) {
                        page.option.isCancelled = true;
                        page.option.close();
                    }
                }, $event);
            }
            this.load = function (ok, failed) {
                this.onLoad(function () {
                    ok();
                }, failed);
            }
            this.failed = function (reason) {
                rs.$broadcast("page_close_failed_evt" + this.fluidId + "_pg_" + this.name, reason);
            }
            this.fullscreen = function (ok, cancel) {
                this.onFullscreen(function () {
                    ok();
                }, function () {
                    cancel();
                });
            }
            this.fluidscreen = function (ok, cancel) {
                this.onFluidscreen(function () {
                    ok();
                }, function () {
                    cancel();
                });
            }
            this.onLoad = function (ok, failed) {
                ok();
            }
            this.onClose = function (ok, cancel) {
                ok();
            }
            this.onChange = function (proceed, cancel, $event) {
                proceed();
            }
            this.onRefresh = function (proceed, cancel, $event) {
                proceed(this);
            }
            this.onDestroy = function () {
            }
            this.onViewportChange = function (viewport) {

            }
            this.onSizeChange = function (size) {

            }
            this.onFullscreen = function (ok, cancel) {
                ok();
            }
            this.onFluidscreen = function (ok, cancel) {
                ok();
            }
            this.clear = function () {
                this.onDestroy();
                fps.pages[this.name] = this.default;
            };
            var def = {};
            angular.copy(this, def);
            this.default = def;
            console.debug("fluidPage-FluidPageg-newPage.page", this);
            return this;
        };
        return fluidPage;
    }])
    .service("fluidPageService", ["$templateCache", "$q", "$sce", function (tc, q, sce) {
        this.pages = [];
        this.loadAjax = function (fluidPage) {
            return q(function (resolve, reject) {
                if (fluidPage.ajax) {
                    var ajax = fluidPage.ajax;
                    if (!ajax.auto) {
                        ajax.auto = true;
                    }
                    if (ajax.auto) {
                        if (ajax.data) {
                            console.debug("fluidPage-fluidPageService.ajax.data", ajax.data);
                            if (fluidPage.isNew || fluidPage.isRefreshed) {
                                if (!fluidPage.cached) {
                                    fluidPage.cached = {}
                                }
                                fluidPage.isNew = false;
                                fluidPage.isRefreshed = false;
                                angular.copy(ajax.data, fluidPage.cached);
                                fluidPage.cached.__proto__ = ajax.data.__proto__;
                                resolve(fluidPage.cached);
                            }
                        }

                        if (fluidPage.isNew || fluidPage.isRefreshed) {
                            if (!fluidPage.cached) {
                                fluidPage.cached = {}
                            }
                            if (ajax.isArray) {
                                var query = fluidPage.resource.query(function () {
                                    fluidPage.isNew = false;
                                    fluidPage.isRefreshed = false;
                                    fluidPage.cached = query;
                                    resolve(query);
                                });
                            } else {
                                fluidPage.resource.get(function (data) {
                                    fluidPage.isNew = false;
                                    fluidPage.isRefreshed = false;
                                    angular.copy(data, fluidPage.cached);
                                    fluidPage.cached.__proto__ = data.__proto__;
                                    resolve(data);
                                });
                            }
                        } else {
                            resolve(fluidPage.cached);
                        }
                    } else {
                        fluidPage.cached = {};
                        resolve(fluidPage.cached);
                    }
                }
            });
        };
        this.clear = function (page) {
            this.pages[page] = undefined;
        };
        this.render = function (page) {
            if (page) {
                if (page.static) {
                    page.home = "template_" + page.id;
                    if (!tc.get(page.home)) {
                        tc.put(page.home, page.html);
                    }
                }

                return sce.trustAsUrl(page.home);
            }

        };
        return this;
    }]);

;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPanel", ["oc.lazyLoad", "fluidHttp", "fluidFrame", "fluidMessage", "fluidOption", "fluidSession", "fluidTool", "fluidPage", "fluidTask", "fluidTaskcontrols", "fluidBreadcrumb", "fluidProgress"])
    .directive("fluidTaskIcon", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: false,
            link: function (scope, element, attr) {

                if (attr.height) {
                    scope.height = attr.height;
                }

                if (attr.width) {
                    scope.width = attr.width;
                }
            },
            template: tc.get("templates/fluid/fluidTaskIcon.html"),
            replace: true
        }
    }])
    .directive("fluidLoader", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: false,
            template: tc.get("templates/fluid/fluidLoader.html"),
            replace: true
        }
    }])
    .directive("fluidPanel", ["$templateCache", "FluidPanel", "fluidToolbarService", "$ocLazyLoad", "$compile", "fluidPanelService", "fluidFrameService", "$viewport", "$window",
        "$anchorScroll", "$location", "FluidProgress",
        function (tc, FluidPanel, ftb, oc, c, fluidPanelService, FluidFrame, v, window, a, l, FluidProgress) {
            return {
                scope: {task: "=", frame: "@"},
                restrict: "E",
                replace: true,
                template: tc.get("templates/fluid/fluidPanel.html"),
                link: {
                    pre: function (scope, element, attr) {
                        scope.$on("$destroy", function () {
                            console.debug("fluidPanel.$destroy", scope.fluidPanel);
                            if (scope.fluidPanel) {
                                scope.fluidPanel.clear();
                                scope.fluidPanel.frame.fluidPanel[scope.fluidPanel.id] = undefined;
                            }
                        });
                        scope.fluidFrame = new FluidFrame(scope.frame);
                        scope.fluidTask = {};
                        scope.viewport = v.view;
                        $(window).on("resize", function () {
                            console.debug("fluid-panel.viewport", v);
                            scope.setViewport();
                        });
                        scope.setViewport = function () {
                            if (!v.is(scope.viewport)) {
                                if (scope.fluidPanel) {
                                    scope.fluidPanel.onViewportChange(v.view);
                                }
                                scope.viewport = v.view;
                            }
                        }
                        scope.loaded = function (fluidPanel) {
                            console.debug("fluidPanel-loaded.fluidPanel", fluidPanel);
                            if (fluidPanel.loaders) {
                                console.debug("fluidPanel-fluidPanel2.fluidPanel.loaders", scope.fluidPanel.loaders);
                                angular.forEach(fluidPanel.loaders, function (load, $index) {
                                    load(this);
                                    this.loaders.splice($index, 1);
                                    if (this.loaders.length === 0) {
                                        fluidPanel.loaded = true;
                                    }
                                }, fluidPanel);
                            }
                        }
                        scope.load = function (ok, cancel, notify) {
                            console.debug("fluidPanel.load");
                            notify("Creating panel...", "info", 1);
                            scope.fluidPanel = undefined;
                            if (scope.task.lazyLoad) {
                                var pathArr = undefined;
                                if (scope.task.moduleFiles.indexOf(",") > 0) {
                                    pathArr = scope.task.moduleFiles.split(",");
                                }

                                var files = [];
                                if (pathArr) {
                                    for (var i = 0; i < pathArr.length; i++) {
                                        files.push(pathArr[i]);
                                    }
                                } else {
                                    files.push(scope.task.moduleFiles);
                                }

                                oc.load({
                                    name: scope.task.moduleJS,
                                    files: files,
                                    cache: true
                                }).then(function () {
                                    scope.fluidPanel = new FluidPanel(scope.task);
                                    scope.fluidPanel.frame = new FluidFrame(scope.frame);
                                    ok(scope.task);
                                    console.debug("fluidPanel.load-1");
                                });
                            } else {
                                scope.fluidPanel = new FluidPanel(scope.task);
                                ok(scope.task);
                                console.debug("fluidPanel.load-2");
                            }
                        }
                        scope.setSize = function (size) {
                            console.debug("fluidPanel2-setSize.size", size);
                            switch (size) {
                                case 25:
                                    scope.size = "col-lg-3";
                                    break;
                                case 50:
                                    scope.size = "col-lg-6";
                                    break;
                                case 75:
                                    scope.size = "col-lg-9";
                                    break;
                                case 100:
                                    scope.size = "col-lg-12";
                                    break;
                                default:
                                    scope.size = "col-lg-12";
                            }
                        }
                        scope.$watch(function (scope) {
                            if (scope.task) {
                                return scope.task.size;
                            }
                        }, function (newSize, oldSize) {
                            if (scope.fluidPanel) {
                                scope.fluidPanel.onSizeChange(newSize);
                            }
                            scope.setSize(newSize);
                        });
                    },
                    post: function (scope, element, attr) {

                        scope.getElementFlowId = function (id) {
                            if (scope.fluidPanel) {
                                return id + "_" + scope.fluidPanel.id;
                            } else {
                                return id + "_" + scope.task.fluidId;
                            }
                        }
                        var frame = new FluidFrame(scope.frame);
                        scope.progress = new FluidProgress({id: "_id_fp_mp_" + scope.task.fluidId});
                        scope.progress.run("fluidPanelLoader", scope.load, {
                            max: 1,
                            min: 0,
                            sleep: 1000
                        });
                        if (frame) {
                            frame.progress.onComplete("switchTask", function (task) {
                                var panel = task.panel();
                                var fluidPanel = new FluidPanel(task);
                                if (panel) {
                                    var panelScope = angular.element(panel).scope();
                                    if (panelScope) {
                                        fluidPanel.progress.run("fluidPanelLoader", panelScope.load, {
                                            max: 1,
                                            min: 0,
                                            sleep: 1000
                                        });
                                    }
                                }
                            });
                        }
                        scope.progress.onComplete("fluidPanelLoader", function (task) {
                            console.debug("progress.onComplete-fluidPanelLoader.task", task);
                            var fluidPanel = new FluidPanel(task);
                            scope.loaded(fluidPanel);
                            task.load(task.ok, task.cancel);
                        });
                        scope.collapsePanel = function () {
                            scope.task.collapsed = !scope.task.collapsed;
                            $("#_id_fp_mp_" + scope.task.fluidId + "_progress").collapse("toggle");
                        }

                    }
                }
            }

        }])
    .directive("id", [function () {
        return {
            restrict: "A",
            scope: false,
            link: function (scope, element, attr) {

                var id = element.attr("id");

                if (scope.task) {
                    if (id && id.indexOf(scope.task.fluidId) > -1) {

                    } else {
                        element.attr("id", attr.id + "_" + scope.task.fluidId)
                    }

                }
                else if (scope.fluidPanel) {
                    if (id && id.indexOf(scope.fluidPanel.id) > -1) {

                    } else {
                        element.attr("id", attr.id + "_" + scope.fluidPanel.id)
                    }

                }
            }
        }
    }])
    .factory("FluidPanel", ["TaskControl", "ToolBarItem", "fluidTaskService", "FluidBreadcrumb", "FluidPage", "$q", "fluidFrameService", "FluidProgress", "FluidMessage", "$timeout",
        function (TaskControl, ToolBarItem, TaskService, FluidBreadcrumb, FluidPage, q, FluidFrame, FluidProgress, FluidMessage, t) {
            var fluidPanel = function (task) {
                console.debug("fluidPanel-FluidPanelModel.task", task);
                if (!task.frame) {
                    throw "Task must have frame property value.";
                }

                var frame = new FluidFrame(task.frame);
                if (!frame.fluidPanel) {
                    frame.fluidPanel = [];
                }
                if (frame.fluidPanel[task.fluidId] != null) {
                    return frame.fluidPanel[task.fluidId];
                }
                else {
                    console.debug("fluidPanel-FluidPanelModel.new", task);

                    var panel = this;
                    this.breadcrumbs = [];
                    this.frame = frame;
                    this.task = task;
                    this.pages = [];
                    this.id = task.fluidId;
                    this.getElementFlowId = function (id) {
                        return id + "_" + this.id;
                    };
                    this.$ = function () {
                        return $("#_id_fp_" + this.id);
                    };
                    this.$scope = function () {
                        return angular.element(this.$()).scope();
                    };
                    this.progress = new FluidProgress({id: this.getElementFlowId("_id_fp_mp")});
                    this.goTo = function (name, $event, option) {
                        var pg = this.pages[name];
                        if (pg != null) {
                            initOption(option, pg);
                            var fluidBreadcrumb = new FluidBreadcrumb(this);
                            var currentPage = this.pages[fluidBreadcrumb.currentPage()];
                            if (currentPage != null) {
                                currentPage.change(function () {
                                    fluidBreadcrumb.addPage(pg)
                                    loadPage(panel);
                                }, function () {
                                    //TODO: parent cancellation handling
                                }, $event);
                            } else {
                                fluidBreadcrumb.addPage(pg);
                                loadPage(panel);
                            }
                        } else {
                            angular.forEach(task.pages, function (page) {
                                if (page.name === name) {
                                    page.fluidId = panel.fluidId;

                                    var fluidPage = new FluidPage(page);
                                    fluidPage.isNew = true;
                                    initOption(option, fluidPage);
                                    var fluidBreadcrumb = new FluidBreadcrumb(this);
                                    var currentPage = this.pages[fluidBreadcrumb.currentPage()];
                                    this.pages[name] = fluidPage;
                                    if (currentPage != null) {
                                        currentPage.change(function () {
                                            fluidBreadcrumb.addPage(page);
                                            loadPage(panel);
                                        }, function () {
                                            //TODO: parent cancellation handling
                                        }, $event);
                                    } else {
                                        fluidBreadcrumb.addPage(page);
                                        loadPage(panel);
                                    }


                                }
                            }, this);
                        }
                    };
                    this.getPage = function (name) {
                        return this.pages[name];
                    };
                    this.prevPage = function ($event) {
                        var fluidBreadcrumb = new FluidBreadcrumb(this);
                        var page = this.pages[fluidBreadcrumb.currentPage()];
                        page.change(function () {
                            fluidBreadcrumb.previous();
                            loadPage(panel);
                        }, function () {
                            //TODO: parent cancellation handling
                        }, $event);
                    };
                    this.nextPage = function ($event) {
                        var fluidBreadcrumb = new FluidBreadcrumb(this);
                        var page = this.pages[fluidBreadcrumb.currentPage()];
                        page.change(function () {
                            fluidBreadcrumb.next();
                            loadPage(panel);
                        }, function () {
                            //TODO: parent cancellation handling
                        }, $event);
                    };
                    this.addControl = function (control) {
                        if (!this.controls) {
                            this.controls = [];
                        }
                        control.fluidPanel = this;
                        addItem(control, this.controls);
                    };
                    this.addToolbarItem = function (toolbarItem) {
                        if (!this.toolbarItems) {
                            this.toolbarItems = [];
                        }
                        toolbarItem.fluidPanel = this;
                        addItem(toolbarItem, this.toolbarItems);
                    };

                    if (!task.page) {
                        if (task.pages) {
                            angular.forEach(task.pages, function (page) {
                                if (page.isHome) {
                                    this.goTo(page.name);
                                }
                            }, this);
                        }
                    } else {
                        if (task.pages) {
                            angular.forEach(task.pages, function (page) {
                                if (task.page === page.name) {
                                    this.goTo(page.name);
                                }
                            }, this);
                        }
                    }

                    var closeControl = new TaskControl(this);
                    closeControl.setId("closePanel");
                    closeControl.glyph = "fa fa-close";
                    closeControl.uiClass = "btn btn-danger";
                    closeControl.label = "Close";
                    closeControl.action = function (task, $event) {
                        console.debug("fluidPanel-fluidPanelModel-close.fluidPanel", this.fluidPanel);
                        this.fluidPanel.close(task, $event);
                    };
                    closeControl.visible = function () {
                        return task.closeable === undefined || task.closeable === true;
                    };
                    this.addControl(closeControl);

                    var expandControl = new TaskControl();
                    expandControl.setId("expandPanel");
                    expandControl.glyph = "fa fa-expand";
                    expandControl.uiClass = "btn btn-info";
                    expandControl.label = "Fullscreen";
                    expandControl.action = function (task, $event) {
                        panel.onFullscreen(function () {
                            panel.destroy = true;
                            panel.frame.toggleFullscreen(panel, task);
                        }, function () {

                        })

                    };
                    expandControl.visible = function () {
                        return !this.fluidPanel.frame.fullScreen;
                    };
                    this.addControl(expandControl);

                    var fluidScreenControl = new TaskControl();
                    fluidScreenControl.setId("fluidPanel");
                    fluidScreenControl.glyph = "fa fa-compress";
                    fluidScreenControl.uiClass = "btn btn-info";
                    fluidScreenControl.label = "Fluid";
                    fluidScreenControl.action = function (task, $event) {
                        panel.onFluidscreen(function () {
                            panel.destroy = true;
                            panel.frame.toggleFullscreen(panel, task);
                        }, function () {

                        });
                    };
                    fluidScreenControl.visible = function () {
                        return this.fluidPanel.frame.fullScreen;
                    };
                    this.addControl(fluidScreenControl);

                    var minimizeControl = new TaskControl()
                    minimizeControl.setId("minimizePanel");
                    minimizeControl.glyph = "fa fa-caret-down";
                    minimizeControl.uiClass = "btn btn-info";
                    minimizeControl.label = "Minimize";
                    minimizeControl.action = function (task, $event) {
                        task.active = false;
                    };
                    minimizeControl.visible = function () {
                        return !this.fluidPanel.frame.fullScreen;
                    };
                    this.addControl(minimizeControl);
                    /* var pageToolBarItem = new ToolBarItem(this);
                     pageToolBarItem.glyph = "fa fa-th-list";
                     pageToolBarItem.uiClass = "btn btn-success";
                     pageToolBarItem.label = "Menu";
                     pageToolBarItem.action = function (task, $event) {

                     }*/

                    var homeToolBarItem = new ToolBarItem();
                    homeToolBarItem.glyph = "fa fa-home";
                    homeToolBarItem.uiClass = "btn btn-info";
                    homeToolBarItem.label = "Home";
                    homeToolBarItem.action = function (task, $event) {
                        if (task.pages) {
                            angular.forEach(task.pages, function (page) {
                                if (page.isHome) {
                                    this.goTo(page.name, $event);
                                }
                            }, this.fluidPanel);
                        }
                    };
                    homeToolBarItem.setId("home_pnl_tool");
                    homeToolBarItem.visible = function () {
                        var breadcrumb = this.fluidPanel.fluidBreadcrumb;
                        var current = this.fluidPanel.pages[breadcrumb.currentPage()];
                        var firstPage = this.fluidPanel.pages[breadcrumb.pages[0]];
                        return (firstPage && firstPage.isHome) && (current && !current.isHome);
                    };
                    this.addToolbarItem(homeToolBarItem);

                    var backToolBarItem = new ToolBarItem();
                    backToolBarItem.glyph = "fa fa-arrow-left";
                    backToolBarItem.uiClass = "btn btn-info";
                    backToolBarItem.label = "Back";
                    backToolBarItem.action = function (task, $event) {
                        this.fluidPanel.prevPage($event);
                    };
                    backToolBarItem.disabled = function () {
                        var fluidBreadcrumb = new FluidBreadcrumb(this.fluidPanel);
                        return !fluidBreadcrumb.hasPrevious();
                    };
                    backToolBarItem.setId("back_pnl_tool");
                    this.addToolbarItem(backToolBarItem);

                    var nextToolBarItem = new ToolBarItem();
                    nextToolBarItem.glyph = "fa fa-arrow-right";
                    nextToolBarItem.uiClass = "btn btn-info";
                    nextToolBarItem.label = "Next";
                    nextToolBarItem.action = function (task, $event) {
                        this.fluidPanel.nextPage($event);
                    };
                    nextToolBarItem.disabled = function () {
                        var fluidBreadcrumb = new FluidBreadcrumb(this.fluidPanel);
                        return !fluidBreadcrumb.hasNext();
                    };
                    nextToolBarItem.setId("next_pnl_tool");
                    this.addToolbarItem(nextToolBarItem);

                    var refreshToolBarItem = new ToolBarItem();
                    refreshToolBarItem.glyph = "fa fa-refresh";
                    refreshToolBarItem.uiClass = "btn btn-info";
                    refreshToolBarItem.label = "Refresh";
                    refreshToolBarItem.action = function (task, $event) {
                        var page = this.fluidPanel.getPage(this.fluidPanel.fluidBreadcrumb.currentPage());
                        page.refresh(page.$scope().loadPage,
                            function () {
                            }, $event);
                    };
                    refreshToolBarItem.setId("refresh_pnl_tool");
                    this.addToolbarItem(refreshToolBarItem);

                    if (task.resource) {
                        task.resource.$get({fluidId: task.fluidId}, function (taskResource) {
                            panel.resource = taskResource;
                        });
                    }
                    this.fluidBreadcrumb = new FluidBreadcrumb(this);
                    this.fluidBreadcrumb.close = function (page, $index, $event) {
                        var previous = this.current;
                        this.current = $index;
                        var breadcrumb = this;
                        var pages = this.pages;
                        var fluidPage = panel.getPage(page);
                        fluidPage.option.returnToPrevious = function () {
                            breadcrumb.current = previous;
                        };
                        fluidPage.close(function (data) {
                            pages.splice($index, 1);
                            if (breadcrumb.current > $index) {
                                breadcrumb.current -= 1;
                            } else if (breadcrumb.current === $index) {
                                breadcrumb.current -= 1;
                            }
                            loadPage(panel);
                        }, function () {
                            breadcrumb.current = previous;
                        }, $event);
                    };
                    this.fluidBreadcrumb.open = function (page, $index, $event) {
                        panel.goTo(page, $event);
                    };

                    this.close = function (task, $event, item) {
                        function closePage($index, fluidPanel) {
                            var breadcrumb = fluidPanel.fluidBreadcrumb;
                            var bPages = fluidPanel.fluidBreadcrumb.pages;
                            var pages = fluidPanel.pages;
                            var reversedPages = [];
                            angular.copy(bPages, reversedPages);
                            reversedPages.reverse();
                            var $length = reversedPages.length;
                            var pageName = reversedPages[$index];
                            var $bIndex = bPages.indexOf(pageName);
                            var previous = breadcrumb.current;
                            breadcrumb.current = $bIndex;

                            console.debug("fluidPanel-FluidPanelModel-closePage.$index", $index);
                            console.debug("fluidPanel-FluidPanelModel-closePage.$bIndex", $bIndex);
                            console.debug("fluidPanel-FluidPanelModel-closePage.$bIndex", previous);

                            var fluidPage = fluidPanel.getPage(pageName);

                            console.debug("fluidPanel-FluidPanelModel-closePage.fluidPage", fluidPage);

                            if ($index < $length) {
                                fluidPage.close(function (data) {
                                    if ($bIndex === 0) {
                                        task.close(function () {
                                            panel.frame.closeTask(task);
                                            panel.destroy = true;
                                            panel.clear();
                                            if (item) {
                                                item.count--;
                                            }
                                        }, function () {

                                        });

                                    } else {
                                        bPages.splice($bIndex, 1);
                                        if (breadcrumb.current > $bIndex) {
                                            breadcrumb.current -= 1;
                                        } else if (breadcrumb.current === $bIndex) {
                                            breadcrumb.current -= 1;
                                        }
                                        closePage($index, fluidPanel);
                                    }
                                }, function () {
                                    breadcrumb.current = previous;
                                }, $event);

                            } else {
                                task.active = false;
                            }
                        }

                        closePage(0, this);
                    };
                    this.clear = function () {
                        this.pages = [];
                        this.fluidBreadcrumb.pages = [];
                        this.progress.clear();
                        this.breadcrumbs = [];
                    };
                    this.onLoad = function (loadedAction) {
                        if (!this.loaders) {
                            this.loaders = [];
                        }
                        if (this.loaded) {
                            loadedAction(this);
                        }

                        this.loaders.push(loadedAction);
                    };
                    this.onViewportChange = function (port) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        console.debug("fluidPanel-fluidPanelModel-onViewportChange.fluidBreadcrumb.currentPage", this.fluidBreadcrumb.currentPage());
                        console.debug("fluidPanel-fluidPanelModel-onViewportChange.page", page);
                        if (page) {
                            page.onViewportChange(port);
                        }
                    };
                    this.onSizeChange = function (size) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        if (page) {
                            page.onSizeChange(size);
                        }
                    };
                    this.onFullscreen = function (ok, cancel) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        if (page) {
                            page.fullscreen(
                                function () {
                                    ok();
                                },
                                function () {
                                    cancel();
                                }
                            );
                        }
                    };
                    this.onFluidscreen = function (ok, cancel) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        if (page) {
                            page.fluidscreen(
                                function () {
                                    ok();
                                },
                                function () {
                                    cancel();
                                }
                            );
                        }
                    };
                    this.message = function (duration) {
                        if (!duration) {
                            duration = 3000;
                        }

                        var fluidMessage = new FluidMessage(this, {
                                template: "_id_fp_msg",
                                duration: duration
                            }
                        );
                        this.$scope().fluidMessage = fluidMessage;

                        return {
                            info: function (message, $event) {
                                fluidMessage.info(message).open($event);
                            },
                            warning: function (message) {
                                fluidMessage.warning(message).open($event);
                            },
                            danger: function (message) {
                                fluidMessage.danger(message).open($event);
                            },
                            success: function (message) {
                                fluidMessage.success(message).open($event);
                            }

                        }
                    };
                    this.currentPage = function () {
                        return this.pages[this.fluidBreadcrumb.currentPage()];
                    };
                    this.$destroy = function () {
                        if (this.destroy) {
                            this.clear();
                            this.frame.fluidPanel[this.id] = undefined;
                        }
                    };
                    frame.fluidPanel[this.id] = this;


                    var pages = this.pages;


                    function checkPages() {
                        console.debug("fluidPanel-checkPages.pages", pages);
                        t(checkPages, 1000);
                    }

                    checkPages();


                    return this;
                }
            };
            return fluidPanel;
        }])
    .service("fluidPanelService", ["$timeout", function (t) {
        this.fluidPanels = [];
        this.clear = function (id) {
            var fluidPanel = this.fluidPanels[id];
            if (fluidPanel) {
                fluidPanel.clear();
            }
            this.fluidPanels[id] = null;

        }
        var fluidPanel = this.fluidPanels;

        function check() {
            console.debug("fluidPanel-fluidPanelService.fluidPanel", fluidPanel);
            t(check, 1000);
        }

        return this;
    }]);

;/**
 * Created by Jerico on 6/19/2015.
 */
angular.module("fluidProgress", [])
    .directive("fluidProgress", ["$templateCache", "fluidProgressService", "FluidProgress", "$timeout", "$q", function (tc, fps, FluidProgress, timeout, q) {
        return {
            restrict: "AE",
            scope: false,
            template: tc.get("templates/fluid/fluidProgress.html"),
            replace: true,
            transclude: true,
            link: function (scope, element, attr) {

                scope.runnerStack = [];
                scope.asynchronous = false;
                scope.max = 0;
                scope.min = 0;
                scope.count = 0;
                if (attr.asynchronous) {
                    scope.asynchronous = attr.asynchronous === "true";
                }
                if (attr.id) {
                    var id = element.attr("id");
                    element.attr("id", id + "_progress");
                    scope.progress = FluidProgress({id: id});
                } else {
                    throw "Id attribute is required.";
                }
                scope.$on(element.attr("id"), function () {
                    console.debug("fluid-progress-'have triggered':  ", element.attr("id"));
                    var progress = scope.progress;
                    angular.forEach(progress.runners, function (runner, $index) {
                        progress.inProgress = true;
                        if (runner.triggered) {
                            runner.triggered = false;
                            var progressBar = element.find(".progress-bar");
                            if (progressBar) {
                                if (runner.max) {
                                    if (scope.max === 0) {
                                        progress.max = 0;
                                    }
                                    progress.max += runner.max;
                                    scope.max += runner.max;
                                }

                                if (runner.min) {
                                    if (scope.min === 0) {
                                        progress.min = scope.min;
                                    }
                                    progress.min += runner.min;
                                    scope.min += runner.min;
                                }

                                if (scope.count === 0) {
                                    progress.count = scope.count;
                                }

                            }
                            if (scope.runner && !scope.asynchronous) {
                                scope.runnerStack.push(runner);
                            } else if (scope.asynchronous) {
                                var defer = q.defer();
                                timeout(function () {
                                    loadRunner(scope, element, runner, progress);
                                    defer.resolve(runner);
                                }, runner.sleep);
                            } else {
                                scope.runner = runner;
                                console.debug("fluid-progress-'have triggered': - currentRunner ", runner);
                            }
                        }

                    });
                });
                scope.startLoader = function () {
                    element.removeClass("fluid-progress");
                    element.addClass("fluid-progress-loading");
                }
                scope.endLoader = function () {
                    element.addClass("fluid-progress");
                    element.removeClass("fluid-progress-loading");
                }
                scope.$watch(function (scope) {
                    return scope.runner;
                }, function (newRunner, oldRunner) {
                    console.debug("fluid-progress.runner.new", newRunner);
                    function checkRunner() {
                        if (newRunner.done || newRunner.cancelled) {
                            if (scope.runnerStack) {
                                scope.runner = scope.runnerStack.shift();
                            }
                        } else {
                            if (!newRunner.inProgress) {
                                newRunner.inProgress = true;
                                loadRunner(scope, element, newRunner, scope.progress);
                            }
                            timeout(checkRunner, newRunner.sleep);
                        }
                    }

                    if (newRunner) {
                        checkRunner();
                    }

                });
                scope.$on("$destroy", function () {
                    if (scope.progress) {
                        scope.progress.completeFuncs = [];
                        scope.progress.cancelledFuncs = [];
                        fps.clearProgress(scope.progress.id);
                    }
                });
            }
        }
    }])
    .factory("FluidProgress", ["fluidProgressService", "$timeout", function (fps, t) {

        var fluidProgress = function (param) {
            console.debug("fluidProgress-FluidProgress.param", param);
            var progress = {};
            if (param.id) {
                if (fps.getFluidProgress(param.id) !== undefined) {
                    progress = fps.getFluidProgress(param.id);
                } else {
                    progress.completeFuncs = [];
                    progress.cancelledFuncs = [];
                    progress.max = 0;
                    progress.min = 0;
                    progress.count = 0;
                    progress.id = param.id;
                    progress.run = function (name, loadFn, options) {
                        var exists = false;
                        console.debug("progress-run.name", name);
                        if (progress.runners) {
                            console.debug("progress-run.runners", progress.runners);
                            for (var i = 0; i < progress.runners.length; i++) {
                                var runner = progress.runners[i];
                                if (runner.name === name) {
                                    exists = true;
                                    runner.done = false;
                                    runner.cancelled = false;
                                    runner.inProgress = false;
                                    runner.triggered = true;
                                    if(loadFn){
                                        runner.load = loadFn;
                                    }
                                    if (options) {
                                        runner.max = options.max ? options.max : runner.max;
                                        runner.min = options.min ? options.min : runner.min;
                                        runner.sleep = options.sleep ? options.sleep : runner.sleep;
                                    }
                                    console.debug("progress-run.saved-triggered.runner", runner);
                                    console.debug("progress-run.saved-triggered.name", name);
                                }
                            }
                        }

                        if (!exists) {
                            var runner = {};
                            if (options) {
                                runner.max = options.max;
                                runner.min = options.min;
                                runner.sleep = options.sleep;
                            }
                            runner.name = name;
                            runner.load = loadFn;
                            runner.message = "Loading please wait...";
                            if (progress.runners === undefined) {
                                progress.runners = [];
                            }
                            runner.triggered = true;
                            progress.runners.push(runner);
                        }

                        progress.element = angular.element(progress.$());
                        console.debug("progress.element", progress.element);

                        var scope = progress.element.scope();
                        if (scope) {
                            progress.element.scope().$broadcast(progress.element.attr("id"));
                            console.debug("progress.triggered", progress.element.attr("id"));
                        }


                    }
                    progress.$ = function () {
                        return $("#" + progress.id + "_progress");
                    }
                    progress.onComplete = function (name, completeFunc) {
                        if (this.completeFuncs[name] == null) {
                            this.completeFuncs[name] = [];
                        }
                        this.completeFuncs[name].push(completeFunc);
                        console.debug("progress.completeFunc-name", name);
                        console.debug("progress.completeFunc", completeFunc);
                        console.debug("progress.completeFuncs", this.completeFuncs);
                    }
                    progress.onCancelled = function (name, cancelledFunc) {
                        if (this.cancelledFuncs[name] == null) {
                            this.cancelledFuncs[name] = [];
                        }
                        this.cancelledFuncs[name].push(completeFunc);
                        console.debug("progress.cancelledFuncs", this.cancelledFuncs);
                    }
                    progress.cancel = function (name, reason) {
                        if (this.cancelledFuncs) {
                            var cancelFuncs = this.cancelledFuncs[name];
                            if (cancelFuncs) {
                                angular.forEach(cancelFuncs, function (func, $index) {
                                    t(function () {
                                        if (func) {
                                            func(reason);
                                        }
                                    });
                                });
                            }
                        }
                    }
                    progress.complete = function (name, resolver) {
                        if (this.completeFuncs) {
                            var completeFuncs = this.completeFuncs[name];
                            console.debug("fluid-progress.complete.name", name);
                            console.debug("fluid-progress.complete.completeFuncs", completeFuncs);
                            if (completeFuncs) {
                                console.debug("fluid-progress.complete.length", completeFuncs.length);
                                angular.forEach(completeFuncs, function (func, $index) {
                                    console.debug("fluid-progress.complete.$index", $index)
                                    t(function () {
                                        if (func) {
                                            func(resolver);
                                        }
                                    });
                                });
                            }

                        }

                    }
                    progress.clear = function () {
                        progress.completeFuncs = [];
                        progress.cancelledFuncs = [];
                        progress.runners = [];
                    }
                    fps.addFluidProgress(progress);

                }


            } else {
                throw "param id is required";
            }

            console.debug("fluid-progress.progress", progress);
            return progress;
        }
        return fluidProgress;
    }])
    .service("fluidProgressService", ["$timeout", function (t) {

        this.addFluidProgress = function (progress) {
            var id = progress.id + "_progress";
            if (this.progressObjects == null) {
                this.progressObjects = [];
            }
            this.progressObjects[id] = progress;
            console.debug("fluid-progress-fluidProgressService-addFluidProgress.progressObjects", this.progressObjects);
            console.debug("fluid-progress-fluidProgressService-addFluidProgress.id", id);
        }

        this.getFluidProgress = function (id) {
            if (this.progressObjects) {
                console.debug("fluid-progress-fluidProgressService-getFluidProgress.id", id);
                console.debug("fluid-progress-fluidProgressService-getFluidProgress.progressObjects", this.progressObjects);
                var key = id + "_progress";
                var progressObject = this.progressObjects[key];
                console.debug("fluid-progress-fluidProgressService-getFluidProgress.progressObject", progressObject);
                return progressObject;
            }
        }

        this.clearProgress = function (id) {
            this.progressObjects[id + "_progress"] = undefined;
        }

        return this;
    }]);;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidSession", ["LocalStorageModule"])
    .service("sessionService", ["localStorageService", function (ls) {

        this.isSessionSupported = ls.isSupported;

        this.type = function () {
            return this.isSessionSupported ? "session storage" : "cookie storage";
        }

        this.isSessionOpened = function () {
            return ls.get(AUTHORIZATION) !== null;
        }


        this.containsKey = function (key) {
            return !(!this.getSessionProperty(key));
        }

        this.addSessionProperty = function (key, value) {
            if (this.isSessionSupported) {
                ls.set(key, value);
            } else {
                ls.cookie.set(key, value);
            }
        }

        this.getSessionProperty = function (key) {
            if (this.isSessionSupported) {
                return ls.get(key);
            } else {
                return ls.cookie.get(key);
            }
        }

        this.login = function (username, password, remember) {
            var base64 = window.btoa(username + ":" + password);
            this.addSessionProperty("remember", remember);
            this.addSessionProperty(AUTHORIZATION, "Basic " + base64);
        }

        this.createSession = function (base64) {
            this.addSessionProperty(AUTHORIZATION, "Basic " + base64);
        }

        this.removeSessionProperty = function (key) {
            if (this.isSessionSupported) {
                return ls.remove(key);
            } else {
                return ls.cookie.remove(key);
            }
        }

        this.logout = function () {
            if (this.isSessionSupported) {
                ls.clearAll();
            } else {
                ls.cookie.clearAll();
            }
        }

    }]);
;/**
 * Created by Jerico on 4/29/2015.
 */
//TODO: create state manager for task; task should not be altered with scope.
var taskKey = "$task_";
var timeout = 30;//sets 30 seconds timeout.

angular.module("fluidTask", ["fluidSession", "fluidFrame"])
    .directive("fluidTask", ["FluidTask", "fluidTaskService", "$compile", "fluidFrameService",
        "$templateCache", function (FluidTask, fluidTaskService, compile, FluidFrame, tc) {
            return {
                restrict: "AE",
                transclude: true,
                replace: true,
                template: "<span><ng-transclude></ng-transclude></span>",
                scope: {name: "@", url: "@", template: "@", frame: "@"},
                link: {
                    pre: function (scope, element, attr) {

                        var transcludeElement = element.find("ng-transclude");
                        if (scope.name) {
                            fluidTaskService.findTaskByName(scope.name).
                                then(function (data) {
                                    scope.load(data);
                                });
                        } else if (scope.url) {
                            fluidTaskService.findTaskByUrl(scope.url).
                                then(function (data) {
                                    scope.load(data);
                                });
                        } else {
                            throw "task name or url is required.";
                        }

                        scope.open = function (page, workspace) {
                            var fluidFrame = new FluidFrame(scope.frame);
                            fluidFrame.openTask(scope._taskName, page, workspace);
                        }

                        scope.load = function (data) {
                            var task = new FluidTask(data);
                            scope._taskName = task.name;

                            scope._pages = task.pages;

                            element.html(transcludeElement.html());

                            element.attr("title", task.title);
                            var openTask = element.find("[open-task]");
                            if (openTask) {
                                openTask.attr("ng-click", "open()");
                            }
                            var icon = element.find(".task-icon");
                            if (icon) {
                                var iconStyle = icon.attr("style");
                                var iconClass = icon.attr("class");
                                var height = icon.attr("height");
                                var width = icon.attr("width");

                                if (task.useImg) {
                                    var img = $("<img>");
                                    img.attr("ng-src", task.imgSrc);

                                    img.attr("height", height ? height : 15);
                                    img.attr("width", width ? width : 15);

                                    if (iconClass) {
                                        img.attr("class", iconClass);
                                    }
                                    if (iconStyle) {
                                        img.attr("style", iconStyle);
                                    }
                                    icon.replaceWith(img.get());
                                } else {
                                    var i = $("<i>");
                                    i.attr("ng-class", "'" + task.glyph + "'");
                                    if (iconClass) {
                                        i.attr("class", iconClass);
                                    }
                                    if (iconStyle) {
                                        i.attr("style", iconStyle);
                                    }
                                    icon.replaceWith(i.get());
                                }
                            }
                            var label = element.find(".task-label");
                            if (label) {
                                var labelClass = label.attr("class");
                                var labelStyle = label.attr("style");
                                var elem = $("<span>");
                                if (labelClass) {
                                    elem.addClass(labelClass);
                                }
                                if (labelStyle) {
                                    elem.attr("style", labelStyle);
                                }

                                elem.html(task.title);
                                label.replaceWith(elem.get());
                            }
                            var pages = element.find(".task-pages");
                            if (pages) {
                                pages.attr("ng-repeat", "page in _pages | pages");
                                var pageLabel = pages.find(".page-label");
                                if (pageLabel) {
                                    pageLabel.html("{{page.title}}");
                                }
                                var openPage = pages.find("[open-page]");
                                if (openPage) {
                                    openPage.attr("ng-click", "open(page.name)");
                                }
                            }


                            compile(element.contents())(scope);
                        }
                    }
                }
            }
        }])
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
                    console.debug("fluid-task-taskState.url", url);
                }
                console.debug("fluid-task-taskState.taskArray", taskArray);
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
                            console.debug("fluidtask: timeOut: ", value);
                            if (counter === timeout) {
                                reject(EVENT_TIME_OUT);
                                return;
                            }
                            if (value.done) {
                                resolve(EVENT_TASK_LOADED);
                                console.debug("fluidtask: resolve: ", value);
                                return;
                            }
                            counter++;
                            t(timeOut, 1000);
                        }

                        timeOut();

                    }
                ).then(function (event) {
                        console.debug("fluidtask: resolve-event: ", event);
                        rs.$broadcast(event);
                    });

            }]
        }

    })
    .factory("fluidTaskService", ["sessionService", "$http", "$q", "fluidStateService", "$rootScope", "$timeout", "$resource", function (ss, h, q, fss, rs, t, r) {
        var taskService = {};

        function timeoutEvent(data) {
            if (data === EVENT_TIME_OUT) {
                rs.$broadcast(EVENT_TIME_OUT, "Task name not found.");
            } else {
                return data;
            }
        }

        taskService.findTaskByName = function (name) {
            console.debug("fluidTask-fluidTaskService-findTaskByName.name", name);
            var key = taskKey + name;
            return q(function (resolve, reject) {

                function waitForTask(counter) {
                    console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.key", counter);
                    console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.counter", counter);
                    console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.fss", fss);
                    if (ss.containsKey(key)) {
                        console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.getSessionProperty", ss.getSessionProperty(key));
                        resolve(ss.getSessionProperty(key));
                        return;
                    } else if (counter === timeout) {
                        reject(EVENT_TIME_OUT);
                        return;
                    }
                    counter++;
                    t(waitForTask, 1000);
                }

                if (ss.containsKey(key)) {
                    resolve(ss.getSessionProperty(key));
                } else {
                    waitForTask(0);
                }

            }).then(timeoutEvent);
        }
        taskService.findTaskByUrl = function (url) {
            console.debug("fluidTask-fluidTaskService-findTaskByUrl.url", url);
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
                    console.debug("fluidTask-fluidTaskService.cacheTask.data", data);
                });
            }

            return deferred.promise;
        }
        taskService.loadAjax = function (task) {
            return q(function (resolve, reject) {

            });
        }
        return taskService;
    }])
    .factory("FluidTask", ["fluidTaskService", "$resource", "fluidFrameHandler", function (fluidTaskService, r, fluidFrameHandler) {
        //TODO: handle task state here; use this in fluidPanel
        var fluidTask = function (defaultTask) {
            var task = {};
            angular.copy(defaultTask, task);

            if (task.ajax) {
                if (task.ajax.url) {
                    if (!task.actions) {
                        task.actions = [];
                    }
                    if (!task.ajax.param) {
                        task.ajax.param = {};
                    }
                    task.resource = r(task.ajax.url, task.ajax.param, task.actions);
                } else {
                    throw "Task ajax.url is required!";
                }
            }

            task.load = function (ok, failed) {
                this.onLoad(function () {
                    ok();
                }, function () {
                    failed();
                });
            }

            task.close = function (ok, cancel) {
                this.onClose(function () {
                    ok();
                }, function () {
                    cancel();
                })
            }

            task.onClose = function (ok, cancel) {
                ok();
            }

            task.onLoad = function (ok, failed) {
                ok();
            }

            task.open = function ($event, frame) {
                if (!task.active) {
                    task.active = true;
                }

                var frame = fluidFrameHandler.frames[frameKey + task.frame];

                if (frame.fullScreen) {
                    frame.switchTo(task);
                } else {
                    var curFrame = $(".fluid-frame[name='" + frame.name + "']");
                    curFrame
                        .ready(function () {
                            var panel = curFrame.find("div.fluid-panel:eq(" + task.index + ")");
                            panel.ready(function () {
                                curFrame.scrollTo(panel, 200);
                            });
                        });
                    console.debug("fluid-task-task.open", "div.fluid-panel :eq(" + task.index + ")");
                }
            }


            task.panel = function () {
                return $("#_id_fp_" + task.fluidId);
            }

            console.debug("fluidTask-FluidTask.newTask", task);
            return task;
        }
        return fluidTask;
    }])
    .service("fluidStateService", [function () {
        this.loaded = false;
        this.urlKeys = [];
        return this;
    }]);

;/**
 * Created by Jerico on 5/3/2015.
 */
angular.module("fluidTaskcontrols", ["fluidTask"])
    .directive("fluidTaskcontrols", ["$templateCache", "fluidControlService", function (tc, fcs) {
        return {
            restrict: "E",
            template: tc.get("templates/fluid/fluidTaskcontrols.html"),
            scope: false,
            link: function (scope, element, attr) {
                if (!scope.fluidPanel) {
                    throw "fluidPanel is required";
                }
            },
            replace: true
        }
    }])
    .factory("TaskControl", [function () {
        var control = function () {
            this.glyph = "fa fa-question";
            this.uiClass = "btn btn-default";
            this.class = "";
            this.label = "";
            this.action = function (task, $event) {
            }
            this.disabled = function () {
                return false;
            }
            this.visible = function () {
                return true;
            }
            this.setId = function (id) {
                this.id = id;
            }
            this.getId = function ($index) {
                if (!this.id) {
                    this.id = "elem_" + $index;
                }
                return this.id + "_ctl_" + this.fluidPanel.id;
            }
        }
        return control;
    }])
    .service("fluidControlService", [function () {
        this.controls = [];
        this.clear = function (id) {
            this.controls[id] = undefined;
        }
        return this;
    }]);;/**
 * Created by jerico on 4/29/2015.
 */
angular.module("fluidTasknav", ["fluidTask", "fluidFrame", "fluidPanel"])
    .directive("fluidTasknav", ["$templateCache", "fluidTasknav", "fluidTaskService", "fluidFrameService", "FluidPanel",
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
    }]);;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidTool", [])
    .directive("fluidTool", ["$templateCache", function (tc) {
        return {
            restrict: "E",
            replace: true,
            scope: false,
            template: tc.get("templates/fluid/fluidToolbar.html"),
            link: {
                post: function (scope, element, attr) {
                }
            }

        }
    }])
    .factory("ToolBarItem", [function () {

        var toolBarItem = function () {
            this.glyph = "fa fa-question";
            this.class = "";
            this.uiClass = "btn btn-default";
            this.label = "";
            this.type = "buttom";
            this.action = function (task, $event) {
            }
            this.showText = false;
            this.disabled = function () {
                return false;
            }
            this.visible = function () {
                return true;
            }
            this.setId = function (id) {
                this.id = id;
            }
            this.getId = function ($index) {
                if (!this.id) {
                    this.id = "elem_" + $index;
                }
                return this.id + "_btn_tl_" + this.fluidPanel.id;
            }
        }

        return toolBarItem;

    }])
    .service("fluidToolbarService", [function () {
        this.toolbarItems = [];
        this.clear = function (id) {
            this.toolbarItems[id] = undefined;
        }

    }]);;angular.module('fluidTemplates', ['templates/fluid/fluidBreadcrumb.html', 'templates/fluid/fluidFrame.html', 'templates/fluid/fluidFrameF.html', 'templates/fluid/fluidFrameNF.html', 'templates/fluid/fluidLoader.html', 'templates/fluid/fluidOption.html', 'templates/fluid/fluidPage.html', 'templates/fluid/fluidPanel.html', 'templates/fluid/fluidProgress.html', 'templates/fluid/fluidTaskIcon.html', 'templates/fluid/fluidTaskcontrols.html', 'templates/fluid/fluidTasknav.html', 'templates/fluid/fluidToolbar.html']);

angular.module("templates/fluid/fluidBreadcrumb.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidBreadcrumb.html",
    "<div class=\"fluid-breadcrumb\" ng-init=\"item=[]\"><div class=\"item hidden-xs hidden-sm hidden25\" ng-repeat=\"bread in breadcrumb.pages\" ng-class=\"item[$index].active\"><span ng-mouseover=\"item[$index].showClose=true && $index > 0;item[$index].active='hovered'\" ng-mouseleave=\"item[$index].showClose=false;item[$index].active='default'\"><span class=\"label\" ng-class=\"breadcrumb.current === $index ?'active':'inactive'\" ng-click=\"breadcrumb.open(bread,$index,$event);collapse()\">{{breadcrumb.getTitle(bread)}}</span> <i ng-if=\"item[$index].showClose\" class=\"fa fa-close text-danger\" title=\"Close {{bread}}\" ng-click=\"breadcrumb.close(bread,$index,$event)\"></i></span></div><div class=\"item-sm hidden-md hidden50 hidden75 hidden100 hidden-fullscreen-md hidden-fullscreen-lg\"><span>{{breadcrumb.getTitle(breadcrumb.currentPage())}}</span></div></div>");
}]);

angular.module("templates/fluid/fluidFrame.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidFrame.html",
    "<div class=\"fluid-frame\" ng-class=\"!frame.fullScreen ?'default-frame':'full'\"></div>");
}]);

angular.module("templates/fluid/fluidFrameF.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidFrameF.html",
    "<fluid-panel task=\"frame.task\" frame=\"{{frame.name}}\" class=\"on-complete fullscreen\" fluid-fullscreen-height></fluid-panel>");
}]);

angular.module("templates/fluid/fluidFrameNF.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidFrameNF.html",
    "<div class=\"on-complete\"><div class=\"fluid-frame-task\"><fluid-panel task=\"task\" frame=\"{{frame.name}}\" fluid-fullscreen-height ng-if=\"!frame.fullScreen || (frame.fullScreen && frame.task.fluidId === task.fluidId)\" ng-repeat=\"task in frame.tasks | filter:{active:true}\"></fluid-panel></div></div>");
}]);

angular.module("templates/fluid/fluidLoader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidLoader.html",
    "<div><style>#{{getElementFlowId('followingBallsG')}} {\n" +
    "        position:relative;\n" +
    "        height:16px;\n" +
    "    }\n" +
    "\n" +
    "    .followingBallsG{\n" +
    "        background-color:#3647FF;\n" +
    "        position:absolute;\n" +
    "        top:0;\n" +
    "        left:0;\n" +
    "        width:16px;\n" +
    "        height:16px;\n" +
    "        -moz-border-radius:8px;\n" +
    "        -moz-animation-name:bounce_followingBallsG;\n" +
    "        -moz-animation-duration:2.2s;\n" +
    "        -moz-animation-iteration-count:infinite;\n" +
    "        -moz-animation-direction:normal;\n" +
    "        -webkit-border-radius:8px;\n" +
    "        -webkit-animation-name:bounce_followingBallsG;\n" +
    "        -webkit-animation-duration:2.2s;\n" +
    "        -webkit-animation-iteration-count:infinite;\n" +
    "        -webkit-animation-direction:normal;\n" +
    "        -ms-border-radius:8px;\n" +
    "        -ms-animation-name:bounce_followingBallsG;\n" +
    "        -ms-animation-duration:2.2s;\n" +
    "        -ms-animation-iteration-count:infinite;\n" +
    "        -ms-animation-direction:normal;\n" +
    "        -o-border-radius:8px;\n" +
    "        -o-animation-name:bounce_followingBallsG;\n" +
    "        -o-animation-duration:2.2s;\n" +
    "        -o-animation-iteration-count:infinite;\n" +
    "        -o-animation-direction:normal;\n" +
    "        border-radius:8px;\n" +
    "        animation-name:bounce_followingBallsG;\n" +
    "        animation-duration:2.2s;\n" +
    "        animation-iteration-count:infinite;\n" +
    "        animation-direction:normal;\n" +
    "    }\n" +
    "\n" +
    "    #{{getElementFlowId('followingBallsG_1')}} {\n" +
    "        -moz-animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{getElementFlowId('followingBallsG_1')}} {\n" +
    "        -webkit-animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{getElementFlowId('followingBallsG_1')}} {\n" +
    "        -ms-animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{getElementFlowId('followingBallsG_1')}} {\n" +
    "        -o-animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{getElementFlowId('followingBallsG_1')}} {\n" +
    "        animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{getElementFlowId('followingBallsG_2')}} {\n" +
    "        -moz-animation-delay:0.22s;\n" +
    "        -webkit-animation-delay:0.22s;\n" +
    "        -ms-animation-delay:0.22s;\n" +
    "        -o-animation-delay:0.22s;\n" +
    "        animation-delay:0.22s;\n" +
    "    }\n" +
    "\n" +
    "    #{{getElementFlowId('followingBallsG_3')}} {\n" +
    "        -moz-animation-delay:0.44s;\n" +
    "        -webkit-animation-delay:0.44s;\n" +
    "        -ms-animation-delay:0.44s;\n" +
    "        -o-animation-delay:0.44s;\n" +
    "        animation-delay:0.44s;\n" +
    "    }\n" +
    "\n" +
    "    #{{getElementFlowId('followingBallsG_4')}} {\n" +
    "        -moz-animation-delay:0.66s;\n" +
    "        -webkit-animation-delay:0.66s;\n" +
    "        -ms-animation-delay:0.66s;\n" +
    "        -o-animation-delay:0.66s;\n" +
    "        animation-delay:0.66s;\n" +
    "    }\n" +
    "\n" +
    "    @-moz-keyframes bounce_followingBallsG{\n" +
    "        0%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "        50%{\n" +
    "            left:189px;\n" +
    "            background-color:#B5D0FF;\n" +
    "        }\n" +
    "\n" +
    "        100%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "    @-webkit-keyframes bounce_followingBallsG{\n" +
    "        0%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "        50%{\n" +
    "            left:189px;\n" +
    "            background-color:#B5D0FF;\n" +
    "        }\n" +
    "\n" +
    "        100%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "    @-ms-keyframes bounce_followingBallsG{\n" +
    "        0%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "        50%{\n" +
    "            left:189px;\n" +
    "            background-color:#B5D0FF;\n" +
    "        }\n" +
    "\n" +
    "        100%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "    @-o-keyframes bounce_followingBallsG{\n" +
    "        0%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "        50%{\n" +
    "            left:189px;\n" +
    "            background-color:#B5D0FF;\n" +
    "        }\n" +
    "\n" +
    "        100%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "    @keyframes bounce_followingBallsG{\n" +
    "        0%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "        50%{\n" +
    "            left:189px;\n" +
    "            background-color:#B5D0FF;\n" +
    "        }\n" +
    "\n" +
    "        100%{\n" +
    "            left:0px;\n" +
    "            background-color:#3647FF;\n" +
    "        }\n" +
    "\n" +
    "    }</style><div id=\"followingBallsG\"><span id=\"followingBallsG_1\" class=\"followingBallsG\"></span> <span id=\"followingBallsG_2\" class=\"followingBallsG\"></span> <span id=\"followingBallsG_3\" class=\"followingBallsG\"></span> <span id=\"followingBallsG_4\" class=\"followingBallsG\"></span></div></div>");
}]);

angular.module("templates/fluid/fluidOption.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidOption.html",
    "<div id=\"fluid_option\" class=\"fluid-option {{task.locked?'locked':''}}\"><div id=\"fluid_option_template\" class=\"fluid-option-template\"></div></div>");
}]);

angular.module("templates/fluid/fluidPage.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidPage.html",
    "<div class=\"fluid-page\" ng-class=\"!fluidPage.loaded ? 'default-page':''\"></div>");
}]);

angular.module("templates/fluid/fluidPanel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidPanel.html",
    "<div id=\"_id_fp\" ng-class=\"!fluidPanel.frame.fullScreen ? 'panel panel-default fluid-task ' + size : 'panel panel-default frame-fullscreen col-lg-12'\" class=\"fluid-panel\"><div class=\"panel-heading\" ng-if=\"!task.locked\"><div class=\"panel-title\"><div class=\"left\"><a ng-if=\"fluidPanel && !progress.inProgress && !fluidFrame.progress.inProgress && !fluidPanel.frame.fullScreen\" href=\"#\" ng-click=\"collapsePanel()\" class=\"fluid-panel-heading-title\"><fluid-task-icon class=\"hidden-xs hidden-sm hidden-md hidden25\"></fluid-task-icon><span class=\"fluid-title-text\">{{task.title}}</span></a> <span ng-if=\"fluidPanel && !progress.inProgress && !fluidFrame.progress.inProgress && fluidPanel.frame.fullScreen\" class=\"fluid-panel-heading-title\"><fluid-task-icon class=\"hidden-xs hidden-sm hidden-md hidden25\"></fluid-task-icon><span class=\"fluid-title-text\">{{task.title}}</span></span><fluid-loader ng-if=\"progress.inProgress || fluidFrame.progress.inProgress\" class=\"fluid-panel-loader\"></fluid-loader></div><fluid-breadcrumb ng-if=\"fluidPanel && !fluidFrame.progress.inProgress && !progress.inProgress\"></fluid-breadcrumb><fluid-taskcontrols ng-if=\"fluidPanel\" class=\"controls\"></fluid-taskcontrols></div></div><div fluid-progress id=\"_id_fp_mp\" class=\"panel-collapse\" ng-class=\"fluidFrame.fullScreen ? 'collapse in': !task.collapsed ? 'collapse in' : 'collapse' \" asynchronous=\"true\"><div ng-if=\"fluidPanel\" id=\"_id_fpb\" class=\"panel-body container-fluid\"><fluid-option></fluid-option><fluid-tool ng-if=\"task.showToolBar\" class=\"width100pc\"></fluid-tool><fluid-page id=\"_id_fp_p\" fluid-panel=\"fluidPanel\" class=\"{{task.showToolBar ? 'toolbar':''}}\"></fluid-page></div></div><script ng-if=\"fluidPanel\" id=\"menu_option\" type=\"text/ng-template\"><div class=\"container-fluid\"></div></script><script id=\"_id_fp_msg\" type=\"text/ng-template\"><div class=\"fluid-message\">\n" +
    "            <p><span class=\"message-icon\"> <i ng-class=\"fluidMessage.icon\"></i> </span> {{fluidMessage.message}}</p>\n" +
    "        </div></script></div>");
}]);

angular.module("templates/fluid/fluidProgress.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidProgress.html",
    "<div class=\"fluid-progress\" ng-transclude></div>");
}]);

angular.module("templates/fluid/fluidTaskIcon.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidTaskIcon.html",
    "<span class=\"fluid-task-icon\"><img ng-if=\"task.useImg\" width=\"{{width? width:15}}\" height=\"{{height?height:15}}\" ng-src=\"{{task.imgSrc}}\"> <i ng-if=\"!task.useImg\" ng-class=\"task.glyph\"></i></span>");
}]);

angular.module("templates/fluid/fluidTaskcontrols.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidTaskcontrols.html",
    "<span class=\"fluid-taskcontrols\"><div class=\"hidden-xs hidden-sm hidden-md hidden25 btn-group btn-group-xs\"><button id=\"{{control.getId($index)}}\" type=\"button\" ng-if=\"control.visible()\" ng-disbabled=\"control.disabled()\" class=\"{{control.uiClass}}\" ng-repeat=\"control in fluidPanel.controls| reverse\" ng-class=\"control.class\" ng-click=\"control.action(task,$event)\"><i class=\"{{control.glyph}} control-glyph\"></i></button></div><div class=\"hidden-fullscreen-lg hidden100 hidden50 hidden75 btn-group btn-group-xs small\"><a href=\"#\" class=\"icon dropdown-toggle fa-inverse\" data-toggle=\"dropdown\"><fluid-task-icon task=\"task\"></fluid-task-icon></a><ul class=\"dropdown-menu dropdown-menu-right dropdown-menu-inverse\"><li id=\"{{control.getId($index)}}\" ng-repeat=\"control in fluidPanel.controls| reverse\" ng-if=\"control.visible() || control.disabled()\" ng-class=\"control.class\"><a href=\"#\" ng-click=\"control.action(task,$event)\">{{control.label}}</a></li></ul></div></span>");
}]);

angular.module("templates/fluid/fluidTasknav.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidTasknav.html",
    "<div id class=\"fluid-tasknav\"><div class=\"input-group\"><input ng-model=\"navSearch\" class=\"form-control\" placeholder=\"Search here\"><div class=\"input-group-addon\"><i class=\"fa fa-search\"></i></div></div><table class=\"table table-responsive\"><tbody ng-repeat=\"group in fluidTasknav.groups\" ng-if=\"!group.empty\"><tr class=\"group\" ng-init=\"group.show = $index == 0 ? true : false\" ng-click=\"group.show=!group.show\"><td><span class=\"pull-left hidden-sm hidden-xs\">{{group.title}}</span></td></tr><tr ng-if=\"group.show\" id=\"group_{{group.name}}_panel\" ng-animate=\"{enter:'slideInDown', leave:'slideOutUp'}\"><td ng-repeat=\"item in group.tasks | filter: navSearch\" ng-init=\"getTask(item); item.count = 0;\" class=\"task-item\"><div class=\"item-title\" ng-click=\"fluidTasknav.getFrameService().openTask(item.name)\"><span class=\"pull-left icon\"><img ng-if=\"item.useImg\" src=\"{{item.imgSrc}}\" width=\"25\" height=\"25\"> <i ng-if=\"!item.useImg\" ng-class=\"item.glyph\"></i></span> <span class=\"pull-left hidden-sm hidden-xs\">{{item.title}}</span> <span class=\"pull-right\"><span ng-if=\"item.count > 1\" class=\"badge\">{{item.count}}</span></span></div><div ng-repeat=\"task in fluidTasknav.getFrameService().tasks | filter : {name:item.name}\" ng-init=\"item.count = ($index + 1)\" class=\"item-task\" ng-mouseover=\"task.showControl=true\" ng-mouseleave=\"task.showControl=false\"><div class=\"task-header\"><span class=\"pull-left\"><i class=\"indicator\" ng-if=\"task.active\" ng-class=\"getPanel(task).loaded ?'text-success fa fa-circle':'fa fa-spinner fa-spin'\"></i>{{task.title}}</span> <span ng-if=\"task.showControl\" class=\"hidden-sm hidden-xs pull-right controls\"><i class=\"hidden-md fa fa-gear text-success\" ng-click=\"task.showSetting=!task.showSetting\"></i> <i class=\"fa fa-close text-danger\" ng-click=\"getPanel(task).close(task, $event, item);\"></i></span></div><div ng-init ng-if=\"task.showSetting\" class=\"settings\" ng-animate=\"{enter:'slideInDown', leave:'slideOutUp'}\"><ul class=\"list-group\"><li class=\"list-group-item list-group-item-heading list-group-item-info\" ng-click=\"task.showPages=!task.showPages\">Pages</li><li ng-if=\"task.showPages\" class=\"list-group-item\" ng-repeat=\"page in task.pages\" ng-click=\"getPanel(task).goTo(page.name,$event)\">{{page.title}}</li><li ng-click=\"task.showSizes=!task.showSizes\" class=\"list-group-item list-group-item-heading list-group-item-info\">Size</li><li ng-if=\"task.showSizes\" class=\"list-group-item\" ng-click=\"task.size=25\">25%</li><li ng-if=\"task.showSizes\" class=\"list-group-item\" ng-click=\"task.size=50\">50%</li><li ng-if=\"task.showSizes\" class=\"list-group-item\" ng-click=\"task.size=75\">75%</li><li ng-if=\"task.showSizes\" class=\"list-group-item\" ng-click=\"task.size=100\">100%</li></ul></div></div></td></tr></tbody></table></div>");
}]);

angular.module("templates/fluid/fluidToolbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidToolbar.html",
    "<div class=\"fluid-toolbar\"><div class=\"btn-group btn-group-sm hidden-xs hidden-sm hidden-md\" ng-if=\"fluidPanel && fluidPanel.toolbarItems && fluidPanel.toolbarItems.length > 0\"><button id=\"{{control.getId($index)}}\" ng-if=\"control.visible()\" ng-disabled=\"control.disabled()\" class=\"{{control.class}}\" ng-repeat=\"control in fluidPanel.toolbarItems\" ng-class=\"control.uiClass\" type=\"{{control.type}}\" title=\"{{control.label}}\" ng-click=\"control.action(task,$event)\"><i class=\"{{control.glyph}}\"></i>{{control.showText ? control.label : ''}}</button></div><div class=\"btn-group btn-group-md hidden-lg\" role=\"toolbar\" ng-if=\"fluidPanel && fluidPanel.toolbarItems && fluidPanel.toolbarItems.length > 0\"><button id=\"{{control.getId($index)}}\" ng-if=\"control.visible()\" ng-disabled=\"control.disabled()\" class=\"{{control.class}}\" ng-repeat=\"control in fluidPanel.toolbarItems\" ng-class=\"control.uiClass\" type=\"{{control.type}}\" title=\"{{control.label}}\" ng-click=\"control.action(task,$event)\"><i class=\"{{control.glyph}}\"></i>{{control.showText ? control.label : ''}}</button></div></div>");
}]);
