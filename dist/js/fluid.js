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
            require: "^fluidFrame",
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
                            return scope.fluidPanel.task.size;
                        }, function (value) {
                            if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
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
            require: "^fluidFrame",
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
                            return scope.fluidPanel.task.size;
                        }, function (value) {
                            if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
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
            require: "^fluidFrame",
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
                            return scope.fluidPanel.task.size;
                        }, function (value) {
                            if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
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
            require: "^fluidFrame",
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
                            return scope.fluidPanel.task.size;
                        }, function (value) {
                            if (v.is("lg") && !scope.fluidPanel.frame.fullScreen) {
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
            require: "^fluidFrame",
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
            require: "^fluidFrame",
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
            require: "^fluidFrame",
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
            require: "^fluidFrame",
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
 * **/;/**
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
                                if (!fluidPage.$scope.$$phase) {
                                    fluidPage.$scope.$apply();
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
            }
        }
    }])
    .factory("FluidBreadcrumb", ["breadcrumbService", function (bcs) {
        var fluidBreadcrumb = function (fluidPanel) {
            if (bcs.breadcrumbs[fluidPanel.id] != null) {
                return bcs.breadcrumbs[fluidPanel.id];
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
                }
                this.open = function (page, $index, $event) {
                    this.current = $index;
                }
                this.getTitle = function (bread) {
                    if (this.fluidPanel) {
                        var page = this.fluidPanel.getPage(bread);
                        if (page) {
                            return page.title;
                        }
                    }
                }
                bcs.breadcrumbs[fluidPanel.id] = this;

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
    .
    service("factoryServer", [function () {
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
angular.module("fluidFrame", ["fluidHttp", "fluidTask", "fluidSession"])
    .directive("fluidFrame", ["$templateCache", "$window", "fluidFrameService", "$viewport", function (tc, window, FrameService, v) {
        return {
            restrict: "E",
            replace: true,
            scope: {name: "@", fullScreen: "=", showWorkspace: "="},
            controller: ["$scope", function (s) {
                if (!s.name) {
                    throw "'name' attribute is required.";
                } else {
                    s.frame = new FrameService(s.name);
                }

            }],
            link: function (scope, element) {
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
            restrict: "A",
            link: function (scope, element, attr) {

                var w = angular.element($w);

                if (attr.offset) {
                    scope.offset = attr.offset;
                }

                w.bind("resize", function () {
                    var maxHeight = element.parent().css("height");
                    if (maxHeight) {
                        console.debug("fluidPanel.fullScreen.resize.maxHeight", maxHeight);
                        console.debug("fluidPanel.fullScreen.resize.innerHeight", element.parent().innerHeight());
                        autoFullscreen(element, maxHeight.replace("px", ""), element.parent().innerWidth());
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
    .factory("fluidFrameService", ["Frame", "fluidTaskService", "FluidTask", function (Frame, taskService, FluidTask) {
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
angular.module("fluidMessage", [])
    .directive("fluidMessage", [function () {
        return {
            restrict: "AE",
            replace: true,
            template: "<div></div>"

        }
    }])
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
    }]);/**
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
                        console.debug("fluidOption-FluidOption.pageScope", page.$scope);
                        c(fluidTemplate.html(html))(page.$scope);
                    } else {
                        c(fluidTemplate.html(html))(fluidPanel.$scope);
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
angular.module("fluidPage", ["fluidHttp", "fluidOption"])
    .directive("fluidPage", ["$templateCache", "fluidPageService", "FluidPage", "$compile", "FluidBreadcrumb", "FluidOption",
        function (tc, fps, FluidPage, c, FluidBreadcrumb, FluidOption) {
            return {
                restrict: "E",
                scope: {page: "=", fluidPanel: "="},
                template: tc.get("templates/fluid/fluidPage.html"),
                link: {
                    pre: function (scope, element, attr) {

                        scope.fluidPageService = fps;

                        scope.loadPage = function (page) {
                            console.debug("fluidPage-loadPage.page", page);
                            scope.fluidPage = page;
                            if (scope.fluidPage.ajax) {
                                fps.loadAjax(page)
                                    .then(function (data) {
                                        scope.data = data;
                                        element.html("<ng-include class='page' src='fluidPageService.render(fluidPage)' onload='onLoad()'></ng-include>");
                                        element.attr("page-name", page.name);
                                        c(element.contents())(scope);
                                        console.debug("fluidPage-loadPage.loaded-page", page);
                                    });
                            } else {
                                element.html("<ng-include class='page' src='fluidPageService.render(fluidPage)' onload='onLoad()'></ng-include>");
                                element.attr("page-name", page.name);
                                c(element.contents())(scope);
                                console.debug("fluidPage-loadPage.loaded-page", page);
                            }


                        }

                        console.debug("fluidPage.fluidPanel", scope.fluidPanel);

                        scope.$watch(function (scope) {
                            return scope.page;
                        }, function (newPage, oldPage) {
                            scope.loadPage(newPage);
                        });


                    },
                    post: function (scope, element, attr) {
                        //TODO: page onLeave handling
                        scope.onLoad = function () {
                            console.debug("fluidPage-page-onload.fluidId", scope.fluidPanel.id);
                            scope.fluidPage.fluidId = scope.fluidPanel.id;
                            scope.fluidPage.$ = function () {
                                return element;
                            };
                            scope.fluidPage.$scope = scope;
                            scope.fluidPage.option = new FluidOption(scope.fluidPanel);
                            scope.fluidPage.loaded = false;
                            //TODO: page onLoad error handling
                            scope.fluidPage.load(function () {
                                scope.fluidPage.loaded = true;
                                if (!scope.fluidPanel.loaded) {
                                    scope.fluidPanel.loaded = true;/*
                                    fixPageHeight(scope.fluidPanel.$());*/
                                }

                            }, function () {
                                scope.fluidPage.loaded = false;
                                if (!scope.fluidPanel.loaded) {
                                    scope.fluidPanel.loaded = true;
                                }
                                scope.fluidPage.onClose = function (ok, cancel) {
                                    return ok();
                                }
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

            this.refresh = function (proceed, cancel, $event) {
                var page = this;
                this.onRefresh(function () {
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
            }

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
                return ok();
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
            }

            var def = {};
            angular.copy(this, def);
            this.default = def;
            console.debug("fluidPage-FluidPageg-newPage.page", this);
        }
        return fluidPage;
    }])
    .service("fluidPageService", ["$templateCache", "$q", "$sce", function (tc, q, sce) {
        this.pages = [];
        this.loadAjax = function (fluidPage) {
            return q(function (resolve, reject) {
                if (fluidPage.ajax) {
                    var ajax = fluidPage.ajax;
                    if (ajax.auto) {
                        if (ajax.isArray) {
                            var query = fluidPage.resource.query(function () {
                                resolve(query);
                            });
                        } else {
                            fluidPage.resource.get(function (data) {
                                resolve(data);
                            });
                        }
                    } else {
                        resolve();
                    }
                }
            });
        }
        this.clear = function (page) {
            this.pages[page] = undefined;
        }
        this.renderPage = function (task, fluid) {
            var page = task.page;

            if (page.static) {
                page.home = fluid.getElementFlowId("template_" + page.name);
                if (!tc.get(page.home)) {
                    tc.put(page.home, page.html);
                }
            } else if (page.ajax) {
                //TODO: text external page
                if (!tc.get(page.home)) {
                    fhs.query(page.ajax, task)
                        .success(function (data) {
                            tc.put(page.ajax.url, data);
                        });
                    page.home = page.ajax.url;
                }
            }
            return page;
        }
        this.render = function (page) {
            if (page) {
                if (page.static) {
                    page.home = "template_" + page.id;
                    if (!tc.get(page.home)) {
                        tc.put(page.home, page.html);
                    }
                } else if (page.ajax) {
                    //TODO: text external page
                    if (!tc.get(page.home)) {
                        fhs.query(page.ajax, task)
                            .success(function (data) {
                                tc.put(page.ajax.url, data);
                            });
                        page.home = page.ajax.url;
                    }
                }
                return sce.trustAsUrl(page.home);
            }

        }
        return this;
    }]);

;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPanel", ["oc.lazyLoad", "fluidHttp", "fluidFrame", "fluidMessage", "fluidOption", "fluidSession", "fluidTool", "fluidPage", "fluidTask", "fluidTaskcontrols", "fluidBreadcrumb"])
    .directive("fluidPanelObselete", ["fluidFrameService", "fluidHttpService", "$templateCache", "$compile",
        "fluidMessageService", "$rootScope", "$q", "$timeout", "$ocLazyLoad",
        "sessionService", "fluidOptionService", "fluidPageService",
        function (f, f2, tc, c, ms, rs, q, t, oc, ss, fos, fps) {
            return {
                scope: {task: '='},
                restrict: "E",
                template: tc.get("templates/fluid/fluidPanelObselete.html"),
                replace: true,
                link: {
                    pre: function (scope, element) {
                        /* Initialize variables*/
                        scope.pathRegexPattern = /{[\w|\d]*}/;

                        scope.fluidPageService = fps;

                        scope.generateUrl = function (url, param) {
                            if (isJson(param)) {
                                param = JSON.parse(param);
                            }
                            for (var key in param) {
                                if (param.hasOwnProperty(key)) {
                                    var reg = new RegExp("{" + key + "}", "g");
                                    url = url.replace(reg, param[key]);
                                }
                            }
                            return url;
                        }

                        scope.fluidFrameService = f;

                        scope.userTask = {};

                        scope.userTask.closed = false;

                        scope.fluid = {};

                        scope.filterPage = function (page) {
                            return (page.showOnList === undefined || page.showOnList == true);
                        }

                        scope.showList = function () {
                            var result = {count: 0};

                            angular.forEach(scope.task.pages, function (page) {
                                if (page.showOnList) {
                                    this.count++;
                                }
                            }, result)

                            return result.count > 1;
                        }

                        scope.toolbars = [
                            {
                                "id": 'showPageList',
                                "glyph": "fa fa-th-list",
                                "label": "Menu",
                                "disabled": false,
                                "uiType": "success",
                                "action": function ($event) {
                                    if (rs.viewport === 'sm' || rs.viewport === 'xs' || (rs.viewport === 'lg' && (!f.fullScreen && (scope.task.size === 50 || scope.task.size === 25)))) {
                                        var source = $event.currentTarget;
                                        console.debug("showPageList-event", $event);
                                        fos.openOption(scope.fluid.getElementFlowId('fluid_option'), scope.fluid.getElementFlowId('pageList'), source);
                                    } else {
                                        scope.task.showPageList = !scope.task.showPageList;
                                    }

                                },
                                "visible": function () {

                                    var result = {count: 0};

                                    angular.forEach(scope.task.pages, function (page) {
                                        if (page.showOnList) {
                                            this.count++;
                                        }
                                    }, result)

                                    return result.count > 1;
                                }
                            },
                            {
                                "id": 'home',
                                "glyph": "fa fa-home",
                                "label": "home",
                                "disabled": false,
                                "uiType": "info",
                                "action": function () {
                                    scope.fluid.goToHome();
                                }
                            },
                            {
                                "id": 'back',
                                "glyph": "fa fa-arrow-left",
                                "label": "back",
                                "disabled": true,
                                "uiType": "info",
                                "action": function () {
                                    if (scope.task.navPages.length > 0 && scope.task.navPages.length > scope.currentPageIndex) {
                                        var i = --scope.currentPageIndex;
                                        var count = scope.task.navPages.length - (i + 1);
                                        var page = scope.task.navPages[i];
                                        scope.task.navPages.splice((i + 1), count);
                                        scope.fluid.navTo(page.name);
                                    } else {
                                        this.disabled = true;
                                    }
                                }
                            },
                            {
                                "id": 'forward',
                                "glyph": "fa fa-arrow-right",
                                "label": "forward",
                                "disabled": true,
                                "uiType": "info",
                                "action": function () {
                                    if (scope.task.navPages.length - 1 > scope.currentPageIndex) {
                                        var page = scope.task.navPages[++scope.currentPageIndex];
                                        scope.fluid.navTo(page.name);
                                    } else {
                                        this.disabled = true;
                                    }
                                }
                            }
                        ];

                        /* Page Event */
                        scope.fluid.openOption = function (templateId, $event) {
                            fos.openOption(scope.fluid.getElementFlowId('fluid_option'), templateId, $event.currentTarget);
                        }

                        scope.fluid.closeOption = function () {
                            fos.closeOption(scope.fluid.getElementFlowId('fluid_option'));
                        }

                        scope.fluid.event = {};

                        scope.fluid.message = {};

                        scope.fluid.message.duration = 3000;

                        scope.http = {};

                        scope.currentPageIndex = 0;


                        scope.fluid.onPageChanging = function (page, param) {
                            return true;
                        }

                        scope.fluid.onRefreshed = function () {
                        };

                        scope.fluid.onOpenPinned = function (page, param) {

                        };

                        scope.fluid.navToTask = function (task) {

                            var $index = {index: 0};

                            angular.forEach(f.taskList, function (tsk, index) {
                                if (tsk.id === task.id) {
                                    this.index = index;
                                }
                            }, $index);

                            t(function () {
                                $(".frame-content").scrollTo($("div.panel[task]:eq(" + $index.index + ") div"), 200);
                            });
                        }

                        scope.fluid.openTaskBaseUrl = "";

                        scope.fluid.openTask = function (name, page, param, newTask, origin, size) {

                            var url = scope.fluid.openTaskBaseUrl;

                            if (size) {
                                url += "size=" + size + "&"
                            } else {
                                url += "size=100&"
                            }

                            url += "active=true&name=" + name;

                            if (page) {

                                url += "&page=" + page;
                            }
                            if (param) {
                                url += "&page-path=" + param;
                            }

                            if (newTask) {
                                url += "&newTask=" + newTask;
                            }

                            f.addTask(url, origin ? origin : scope.task, true);
                        }

                        var parent = element.parent();

                        /***********/
                        /* Getters for IDs */
                        scope.fluid.getHomeUrl = function () {
                            return f2.host + scope.homeUrl;
                        };

                        scope.fluid.getElementFlowId = function (id) {
                            return id + "_" + scope.task.id;
                        };

                        scope.fluid.getEventId = function (id) {
                            return id + "_fp_" + scope.task.id;
                        };

                        scope.fluid.event.getResizeEventId = function () {
                            return scope.fluid.getEventId("rsz_evt_id_");
                        };

                        scope.fluid.event.getPageCallBackEventId = function () {
                            return "task_fluid_page_call_back_event_id_" + scope.task.id;
                        };

                        scope.fluid.event.getOnTaskLoadedEventId = function () {
                            return scope.fluid.getEventId("on_ld_tsk_evt_id_");
                        };

                        scope.fluid.event.getGoToEventId = function () {
                            return goToEventID + scope.task.id;
                        };

                        scope.fluid.event.getRefreshId = function () {
                            return scope.fluid.getEventId("tsk_rfh_id_");
                        };

                        scope.fluid.event.getSuccessEventId = function () {
                            return scope.fluid.getEventId("suc_evt_id_");
                        };

                        scope.fluid.event.getErrorEventId = function () {
                            return scope.fluid.getEventId("err_evt_id_");
                        };

                        /********************/


                        /* Integrated Alerts */
                        var messageId = scope.fluid.getElementFlowId("pnl_msg");

                        scope.fluid.message.info = function (msg) {
                            ms.info(messageId, msg, scope.fluid.message.duration).open();
                        };

                        scope.fluid.message.warning = function (msg) {
                            ms.warning(messageId, msg, scope.fluid.message.duration).open();
                        };

                        scope.fluid.message.danger = function (msg) {
                            ms.danger(messageId, msg, scope.fluid.message.duration).open();
                        };

                        scope.fluid.message.success = function (msg) {
                            ms.success(messageId, msg, scope.fluid.message.duration).open();
                        };

                        /*********************/


                        /* Controls */
                        scope.fluid.controls = undefined; //register controls


                        /* HTTP API */
                        scope.http.get = function (url, param) {
                            if (param) {
                                if (url.search(scope.pathRegexPattern) > 0) {
                                    url = scope.generateUrl(url, param);
                                } else {
                                    url = url + param;
                                }
                            }
                            return f2.get(url, scope.task);
                        };

                        scope.http.delete = function (url, param) {
                            if (param) {
                                if (url.search(scope.pathRegexPattern) > 0) {
                                    url = scope.generateUrl(url, param);
                                } else {
                                    url = url + param;
                                }
                            }
                            return f2.delete(url, scope.task);
                        };

                        scope.http.post = function (url, data, param) {
                            if (param) {
                                if (url.search(scope.pathRegexPattern) > 0) {
                                    url = scope.generateUrl(url, param);
                                } else {
                                    url = url + param;
                                }
                            }
                            return f2.post(url, data, scope.task);
                        };

                        scope.http.put = function (url, data, param) {
                            if (param) {
                                if (url.search(scope.pathRegexPattern) > 0) {
                                    url = scope.generateUrl(url, param);
                                } else {
                                    url = url + param;
                                }
                            }
                            return f2.put(url, data, scope.task);
                        };

                        /*********************/

                        /* Action */
                        scope.loadGet = function () {

                            if (!rs.$$phase) {
                                scope.$apply();
                            }

                            if (scope.fluid.controls) {
                                angular.forEach(scope.fluid.controls, function (control) {
                                    if (control.pages) {
                                        scope.fluid.addControl(control, control.pages);
                                    }
                                });
                            }

                            if (scope.task.prevPage) {
                                if (scope.task.prevPage.destroy) {
                                    scope.task.prevPage.destroy();
                                }
                            }

                            console.debug("autoget-page", scope.task.page);
                            return q(function (resolve, reject) {
                                if ((scope.task.page !== undefined && scope.task.page !== null) && (scope.task.page.autoGet && scope.task.page.autoGet === true)) {
                                    scope.task.currentPage = scope.task.page.name;
                                    var url = scope.homeUrl;
                                    if (scope.task.page.getParam) {
                                        if (scope.homeUrl.search(scope.pathRegexPattern) > 0) {
                                            url = scope.generateUrl(scope.homeUrl, scope.task.page.getParam);
                                        } else {
                                            url = scope.homeUrl + scope.task.page.getParam;
                                        }
                                    }
                                    console.debug("auto-get-url", url);
                                    f2.get(url, scope.task)
                                        .success(function (data) {
                                            console.debug("autoget", data);
                                            resolve({page: scope.task.page.name, value: data});
                                        });
                                } else if ((scope.task.page !== undefined && scope.task.page !== null) && (!scope.task.page.autoGet || scope.task.page.autoGet === null || scope.task.page.autoGet === false)) {
                                    scope.task.currentPage = scope.task.page.name;
                                    console.debug("autoget false", false);
                                    resolve({page: scope.task.page.name});
                                }
                            }).then(function (data) {
                                scope.task.pageLoaded = true;
                                var pagePanel = element.find(".fluid-panel-page");
                                console.debug("page-panel", pagePanel);
                                console.debug("page-panel-task", scope.task);
                                pagePanel.ready(function () {
                                    t(function () {

                                        if (scope.task.pinned) {
                                            scope.task.loaded = true;
                                            scope.fluid.onOpenPinned(scope.task.page, scope.task.pageParam);
                                        } else {

                                            if (!scope.task.page.load && scope.fluid.pageCallBack) {
                                                scope.fluid.pageCallBack(data.page, data.value);
                                                if (!rs.$$phase) {
                                                    scope.$apply();
                                                }
                                                scope.task.loaded = true;
                                            } else {
                                                /* TODO: remove task life cycle*/
                                                if (scope.task.page.load) {
                                                    scope.task.page.load(data.value);
                                                }
                                                if (!rs.$$phase) {
                                                    scope.$apply();
                                                }

                                                scope.task.loaded = true;
                                            }

                                        }

                                    }, 400);
                                });
                            });
                        };

                        scope.fluid.addControl = function (control, pageName) {
                            var exists = false;

                            angular.forEach(scope.toolbars, function (ctl) {
                                if (control.id === ctl.id) {
                                    exists = true;
                                }
                            });

                            if (Array.isArray(pageName)) {

                                var index = pageName.indexOf(scope.task.page.name);
                                if (index > -1) {
                                    if (!exists) {
                                        scope.toolbars.push(control);
                                    }
                                } else {
                                    if (exists) {
                                        for (var t = scope.toolbars.length - 1; t > 0; t--) {
                                            var toolbar = scope.toolbars[t];
                                            if (toolbar.id === control.id) {
                                                scope.toolbars.splice(t, 1);
                                            }
                                        }
                                    }

                                }
                            }

                            else if (scope.task.page.name === pageName) {
                                if (!exists) {
                                    scope.toolbars.push(control);
                                }
                            } else if (exists) {
                                for (var t = scope.toolbars.length - 1; t > 0; t--) {
                                    var toolbar = scope.toolbars[t];
                                    if (toolbar.id === control.id) {
                                        scope.toolbars.splice(t, 1);
                                        break;
                                    }
                                }

                            }
                        };

                        scope.navToPage = function (name) {
                            return q(function (resolve) {
                                angular.forEach(scope.task.navPages, function (page) {
                                    if (name === page.name) {
                                        scope.task.prevPage = scope.task.page;
                                        scope.task.page = page;

                                        var uri = page.get;

                                        if (scope.task.page.param !== undefined && scope.task.page.param != null) {
                                            if (uri.search(scope.pathRegexPattern) > 0) {
                                                uri = scope.generateUrl(uri, scope.task.page.param);
                                            } else {
                                                uri = uri + scope.task.page.param;
                                            }
                                        }

                                        scope.homeUrl = uri;

                                        for (var i = 0; i < scope.task.navPages.length; i++) {
                                            if (scope.task.navPages[i].name === name) {
                                                scope.currentPageIndex = i;
                                                break;
                                            }
                                        }

                                        for (var i = 0; i < scope.toolbars.length; i++) {
                                            if (scope.toolbars[i].id === 'back') {
                                                scope.toolbars[i].disabled = !(scope.currentPageIndex > 0);
                                            }
                                            if (scope.toolbars[i].id === 'forward') {
                                                scope.toolbars[i].disabled = !(scope.currentPageIndex < scope.task.navPages.length - 1);
                                            }
                                        }
                                        resolve();
                                    }
                                });
                            });
                        };

                        scope.fluid.navTo = function (name) {
                            if (scope.fluid.onPageChanging(name)) {
                                return scope.navToPage(name).then(scope.loadGet());
                            }
                        };

                        scope.getToPage = function (name, param) {
                            console.debug("getToPage", scope.task.pages);
                            return q(function (resolve, reject) {
                                angular.forEach(scope.task.pages, function (page) {
                                        if (name === page.name) {

                                            scope.task.prevPage = {};

                                            angular.copy(scope.task.page, scope.task.prevPage);

                                            scope.task.page = page;

                                            var uri = page.get;

                                            if (param !== undefined && param !== "null") {

                                                page.param = param;
                                                if (uri.search(scope.pathRegexPattern) > 0) {
                                                    uri = scope.generateUrl(uri, param);
                                                } else {
                                                    uri = uri + param;
                                                }
                                            } else if (page.param) {
                                                if (uri.search(scope.pathRegexPattern) > 0) {
                                                    uri = scope.generateUrl(uri, param);
                                                } else {
                                                    uri = uri + param;
                                                }
                                            }


                                            scope.homeUrl = uri;

                                            if (scope.task.pinned === true) {
                                                scope.userTask.page = scope.task.page.name;
                                                scope.userTask.param = scope.task.page.param;

                                                if (scope.task.generic === false) {
                                                    if (scope.task.id.indexOf("gen") === -1) {
                                                        scope.userTask.fluidTaskId = scope.task.id.split("_")[0];
                                                        scope.userTask.fluidId = scope.task.fluidId;
                                                        scope.userTask.pinned = scope.task.pinned;
                                                        f2.post("services/fluid_user_task_crud/save_task_state?field=pin", scope.userTask, scope.task);
                                                    }
                                                }
                                            }

                                            var contains = false;

                                            for (var i = 0; i < scope.task.navPages.length; i++) {
                                                if (scope.task.navPages[i].name === name) {
                                                    contains = true;
                                                    scope.currentPageIndex = i;
                                                    break;
                                                }
                                            }

                                            if (contains === false) {
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
                                            resolve();
                                        }
                                    }
                                )
                            });
                        };

                        scope.fluid.goTo = function (name, param) {
                            console.debug("goTo", name);
                            if (scope.fluid.onPageChanging(name, param)) {
                                return scope.getToPage(name, param).then(scope.loadGet());
                            }
                        };

                        scope.$watch(function (scope) {
                                return scope.task.currentPage;
                            },
                            function (newValue) {
                                if (newValue) {
                                    scope.fluid.goTo(newValue.name, newValue.param);
                                }
                            });

                        scope.fluid.action = function (method, data, param) {
                            if (method) {
                                var uri = "";
                                if (method.toLowerCase() === "put") {
                                    uri = scope.task.page.put;
                                    if (param !== undefined && param !== "null") {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, param);
                                        } else {
                                            uri = uri + param;
                                        }
                                    }
                                    f2.put(uri, data, scope.task)
                                        .success(function (rv) {
                                            rs.$broadcast(scope.fluid.event.getSuccessEventId(), rv, method);
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.fluid.message.danger(data.msg);
                                            } else {
                                                scope.fluid.message.danger("Error creating request to " + uri);
                                            }

                                            rs.$broadcast(scope.fluid.event.getErrorEventId(), data, method);
                                        });

                                } else if (method.toLowerCase() === "get") {
                                    uri = scope.task.page.get;
                                    if (param !== undefined && param !== "null") {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, param);
                                        } else {
                                            uri = uri + param;
                                        }
                                    }
                                    f2.get(uri, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                if (rv.msg) {
                                                    scope.fluid.message.success(rv.msg);
                                                }
                                            }
                                            rs.$broadcast(scope.fluid.event.getSuccessEventId(), rv, method);
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.fluid.message.danger(data.msg);
                                            }
                                            rs.$broadcast(scope.fluid.event.getErrorEventId(), data, method);
                                        });

                                } else if (method.toLowerCase() === "delete") {
                                    uri = scope.task.page.delURL;
                                    if (param !== undefined && param !== "null") {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, param);
                                        } else {
                                            uri = uri + param;
                                        }
                                    }
                                    f2.delete(uri, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                if (rv) {
                                                    if (rv.msg) {
                                                        scope.fluid.message.success(rv.msg);
                                                    }
                                                }
                                                rs.$broadcast(scope.fluid.event.getSuccessEventId(), rv, method);
                                            }
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.fluid.message.danger(data.msg);
                                            }
                                            rs.$broadcast(scope.fluid.event.getErrorEventId(), data, method);
                                        });
                                } else if (method.toLowerCase() === "post") {
                                    uri = scope.task.page.post;

                                    if (param !== undefined && param !== "null") {
                                        if (uri.search(scope.pathRegexPattern) > 0) {
                                            uri = scope.generateUrl(uri, param);
                                        } else {
                                            uri = uri + param;
                                        }
                                    }

                                    f2.post(uri, data, scope.task)
                                        .success(function (rv) {
                                            if (rv) {
                                                if (rv.msg) {
                                                    scope.fluid.message.success(rv.msg);
                                                }
                                            }
                                            rs.$broadcast(scope.fluid.event.getSuccessEventId(), rv, method);
                                        })
                                        .error(function (data) {
                                            if (data) {
                                                scope.fluid.message.danger(data.msg);
                                            }
                                            rs.$broadcast(scope.fluid.event.getErrorEventId(), data, method);
                                        });
                                }

                            }

                        };

                        scope.fluid.goToHome = function () {
                            angular.forEach(scope.task.pages, function (page) {
                                if (page.isHome) {
                                    scope.task.page = page;
                                    scope.homeUrl = page.get;

                                    if (page.param) {
                                        scope.homeUrl = scope.homeUrl + page.param;
                                    }

                                    for (var i = 0; i < scope.toolbars.length; i++) {
                                        if (scope.toolbars[i].id === 'back') {
                                            scope.toolbars[i].disabled = true;
                                        }
                                        if (scope.toolbars[i].id === 'forward') {
                                            scope.toolbars[i].disabled = true;
                                        }
                                    }
                                    scope.currentPageIndex = 0;
                                    scope.task.navPages = [page];

                                    scope.loadGet();
                                }
                            });

                        };

                        /*Instance creation*/
                        scope.$watch(function (scope) {
                                return scope.task;
                            }, function (task) {
                                if (task) {
                                    if (task.generic) {
                                        scope.task.page = undefined;
                                        var taskUrl = scope.task.url;
                                        var taskId = undefined;

                                        if (!scope.task.url) {
                                            scope.baseTask = scope.task;
                                            var newTask = scope.task.newTask;
                                            var $task = {};
                                            scope.copy = {};
                                            angular.copy(scope.task, scope.copy);
                                            taskId = scope.baseTask.id;
                                            if (!f.fullScreen) {
                                                angular.forEach(f.taskList, function (task, key) {

                                                    if (task.id === scope.task.id) {
                                                        this.task = task;
                                                        this.index = key;
                                                    }

                                                }, $task);

                                                f.taskList[$task.index] = f.buildTask(scope.baseTask);
                                                f.taskList[$task.index].id = f.taskList[$task.index].id + "_" + $task.index;
                                                f.taskList[$task.index].origin = scope.task.origin;
                                                scope.task = f.taskList[$task.index];
                                            } else {
                                                scope.task = f.buildTask(scope.baseTask);
                                                scope.task.id = "fullscreen_" + scope.baseTask.id;
                                            }
                                            scope.task.generic = false;
                                            scope.task.newTask = newTask;
                                            scope.task.fluidHttpService = f2;
                                        } else {
                                            scope.baseTask = ss.getSessionProperty(scope.task.url);
                                            if (scope.baseTask) {
                                                console.debug("fluid-panel-base-task-cache", scope.baseTask);
                                                var newTask = scope.task.newTask;
                                                var $task = {};
                                                scope.copy = {};
                                                angular.copy(scope.task, scope.copy);
                                                console.debug("fluid-panel-cache-task", scope.baseTask);

                                                taskId = scope.baseTask.id;
                                                if (!f.fullScreen) {
                                                    angular.forEach(f.taskList, function (task, key) {

                                                        if (task.id === scope.task.id) {
                                                            this.task = task;
                                                            this.index = key;
                                                        }

                                                    }, $task);

                                                    f.taskList[$task.index] = f.buildTask(scope.baseTask);
                                                    f.taskList[$task.index].id = f.taskList[$task.index].id + "_" + $task.index;
                                                    f.taskList[$task.index].origin = scope.task.origin;
                                                    scope.task = f.taskList[$task.index];
                                                } else {
                                                    scope.task = f.buildTask(scope.baseTask);
                                                    scope.task.id = "fullscreen_" + scope.baseTask.id;
                                                }
                                                scope.task.generic = false;
                                                scope.task.newTask = newTask;
                                                scope.task.fluidHttpService = f2;
                                            } else {
                                                console.debug("fluid-panel-base-task-new", scope.baseTask);
                                                f2.get(scope.task.url, scope.task).success(function (d) {
                                                    ss.addSessionProperty(scope.task.url, d);
                                                    var newTask = scope.task.newTask;
                                                    var $task = {};
                                                    scope.copy = {};
                                                    angular.copy(scope.task, scope.copy);
                                                    console.debug("generated-taskp", d);
                                                    taskId = d.id;
                                                    if (!f.fullScreen) {
                                                        angular.forEach(f.taskList, function (task, key) {

                                                            if (task.id === scope.task.id) {
                                                                this.task = task;
                                                                this.index = key;
                                                            }

                                                        }, $task);
                                                        f.taskList[$task.index] = f.buildTask(d);
                                                        f.taskList[$task.index].id = f.taskList[$task.index].id + "_" + $task.index;
                                                        f.taskList[$task.index].origin = scope.task.origin;
                                                        scope.task = f.taskList[$task.index];
                                                    } else {
                                                        scope.task = f.buildTask(d);
                                                        scope.task.id = "fullscreen_" + d.id;
                                                    }
                                                    scope.task.generic = false;
                                                    scope.task.newTask = newTask;
                                                    scope.task.fluidHttpService = f2;
                                                    console.debug("task-initialization-finished", scope.task);
                                                    console.debug("generated-task-pages", scope.task.pages);
                                                });
                                            }

                                        }

                                        scope.task.signature = {id: taskId, url: taskUrl};
                                    }
                                }

                            }
                        );
                    },
                    post: function (scope, element) {

                        var parent = element.parent();

                        scope.$on(scope.fluid.getEventId("navTo"), function (event, name) {
                            scope.fluid.navTo(name);
                        });

                        scope.$on(scope.fluid.getEventId("selectPage"), function (event, name) {
                            var i = scope.currentPageIndex;
                            for (var index = 0; i < scope.task.navPages.length; i++) {
                                if (scope.task.navPages[index].name == name) {
                                    i = index;
                                    break;
                                }
                            }
                            var count = scope.task.navPages.length - (i + 1);
                            var page = scope.task.navPages[i];
                            scope.task.navPages.splice((i + 1), count);
                            scope.fluid.navTo(name);
                            scope.task.page = page;
                        });

                        scope.$on(scope.fluid.event.getGoToEventId(), function (event, name, param) {
                            scope.fluid.goTo(name, param);
                        });

                        scope.$on(scope.fluid.event.getOnTaskLoadedEventId(), function (event) {
                        });

                        scope.$on(EVENT_NOT_ALLOWED + scope.task.id, function (event, msg) {
                            scope.fluid.message.danger(msg);
                            angular.forEach(scope.task.navPages, function (page, key) {

                                if (page.name === scope.task.navPages.name) {
                                    scope.task.navPages.splice(key, 1);
                                    scope.fluid.goTo(scope.task.prevPage.name);
                                }
                            });

                        });

                        /* Post creation */


                        scope.$watch(function (scope) {
                            if (scope.task) {
                                return scope.task;
                            }
                            return;
                        }, function (task) {
                            if (task) {
                                if (task.generic === false) {
                                    if (task.lazyLoad === true) {
                                        var pathArr = undefined;
                                        if (task.moduleFiles.indexOf(",") > 0) {
                                            pathArr = task.moduleFiles.split(",");
                                        }

                                        var files = [];
                                        if (pathArr) {
                                            for (var i = 0; i < pathArr.length; i++) {
                                                files.push(pathArr[i]);
                                            }
                                        } else {
                                            files.push(task.moduleFiles);
                                        }

                                        oc.load({
                                            name: task.moduleJS,
                                            files: files,
                                            cache: true
                                        }).then(function () {
                                            t(function () {
                                                generateTask(scope, t, f2);
                                            });
                                        });
                                    } else {
                                        t(function () {
                                            generateTask(scope, t, f2);
                                        });
                                    }
                                    scope.task.refresh = function () {
                                        if (scope.task.page.autoGet) {
                                            scope.task.loaded = false;
                                            f2.get(scope.homeUrl, scope.task)
                                                .success(function (data) {
                                                    if (scope.task.page.load) {
                                                        scope.task.page.load(data, "refresh");
                                                    }
                                                    if (scope.fluid.pageCallBack) {
                                                        scope.fluid.pageCallBack(scope.task.page.name, data, "refresh");
                                                    }
                                                    scope.task.loaded = true;
                                                })
                                                .error(function (data) {
                                                    scope.task.loaded = true;
                                                });
                                        } else {
                                            rs.$broadcast(scope.fluid.event.getRefreshId());
                                            scope.fluid.onRefreshed();
                                        }
                                    };
                                    scope.task.max25 = function (clientState) {
                                        scope.task.size = 25;
                                        parent.removeClass("col-lg-12");
                                        parent.removeClass("col-lg-9");
                                        parent.removeClass("col-lg-6");
                                        parent.addClass("col-lg-3");
                                        task.showPageList = false;
                                        if (clientState === undefined || clientState === false) {
                                            if (scope.task.page && scope.task) {
                                                rs.$broadcast(scope.fluid.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                            }
                                            scope.userTask.size = scope.task.size;

                                            if (scope.task.stateAjax) {
                                                saveTaskSate(scope.task, scope.userTask, f2, "size")
                                                    .then(function () {
                                                        generateTask(scope, t, f2);
                                                    });
                                            } else {
                                                generateTask(scope, t, f2);
                                            }
                                        }

                                    };
                                    scope.task.max50 = function (clientState) {
                                        scope.task.size = 50;
                                        parent.removeClass("col-lg-12");
                                        parent.removeClass("col-lg-9");
                                        parent.removeClass("col-lg-3");
                                        parent.addClass("col-lg-6");
                                        task.showPageList = false;
                                        if (clientState === undefined || clientState === false) {
                                            if (scope.task.page && scope.task) {
                                                rs.$broadcast(scope.fluid.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                            }
                                            scope.userTask.size = scope.task.size;
                                            if (scope.task.stateAjax) {
                                                saveTaskSate(scope.task, scope.userTask, f2, "size")
                                                    .then(function () {
                                                        generateTask(scope, t, f2);
                                                    });
                                            } else {
                                                generateTask(scope, t, f2);
                                            }
                                        }
                                    };
                                    scope.task.max75 = function (clientState) {
                                        scope.task.size = 75;
                                        parent.removeClass("col-lg-12");
                                        parent.removeClass("col-lg-6");
                                        parent.removeClass("col-lg-3");
                                        parent.addClass("col-lg-9");
                                        if (clientState === undefined || clientState === false) {
                                            if (scope.task.page && scope.task) {
                                                rs.$broadcast(scope.fluid.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                            }
                                            scope.userTask.size = scope.task.size;
                                            if (scope.task.stateAjax) {
                                                saveTaskSate(scope.task, scope.userTask, f2, "size")
                                                    .then(function () {
                                                        generateTask(scope, t, f2);
                                                    });
                                            } else {
                                                generateTask(scope, t, f2);
                                            }
                                        }

                                    };
                                    scope.task.max100 = function (clientState) {
                                        scope.task.size = 100;
                                        parent.removeClass("col-lg-9");
                                        parent.removeClass("col-lg-6");
                                        parent.removeClass("col-lg-3");
                                        parent.addClass("col-lg-12");
                                        if (clientState === undefined || clientState === false) {
                                            if (scope.task.page && scope.task) {
                                                rs.$broadcast(scope.fluid.event.getResizeEventId(), scope.task.page.name, scope.task.size);
                                            }
                                            scope.userTask.size = scope.task.size;

                                            if (scope.task.stateAjax) {
                                                saveTaskSate(scope.task, scope.userTask, f2, "size")
                                                    .then(function () {
                                                        generateTask(scope, t, f2);
                                                    });
                                            } else {
                                                generateTask(scope, t, f2);
                                            }

                                        }
                                    };
                                    /*TODO: provide ways to add custom task state uri*/
                                    scope.task.hide = function () {
                                        if (scope.task.onWindowHiding(scope.task.page)) {
                                            if (scope.fluidFrameService.fullScreen) {
                                                scope.task.fluidScreen();
                                            }
                                            scope.task.active = false;
                                            scope.userTask.active = scope.task.active;
                                            if (scope.task.stateAjax) {
                                                saveTaskSate(scope.task, scope.userTask, f2, "active");
                                            }
                                        }

                                    };
                                    scope.task.close = function () {
                                        if (scope.task.onWindowClosing(scope.task.page)) {
                                            if (scope.task.stateAjax) {
                                                saveTaskSate(scope.task, scope.userTask, f2, "close")
                                                    .then(function () {
                                                        for (var i = 0; i < f.taskList.length; i++) {
                                                            var task = f.taskList[i];
                                                            if (scope.task.id === task.id) {
                                                                f.taskList.splice(i, 1);
                                                            }
                                                            if (scope.fluidFrameService.fullScreen) {
                                                                scope.task.fluidScreen();
                                                            }
                                                            if (!rs.$$phase) {
                                                                scope.$apply();
                                                            }
                                                        }
                                                        scope.$destroy();
                                                    });
                                            } else {
                                                for (var i = 0; i < f.taskList.length; i++) {
                                                    var task = f.taskList[i];
                                                    if (scope.task.id === task.id) {
                                                        f.taskList.splice(i, 1);
                                                    }
                                                    if (scope.fluidFrameService.fullScreen) {
                                                        scope.task.fluidScreen();
                                                    }
                                                    if (!rs.$$phase) {
                                                        scope.$apply();
                                                    }
                                                }
                                                scope.$destroy();
                                            }
                                        }

                                    };

                                    scope.task.pin = function () {
                                        scope.task.pinned = !scope.task.pinned;
                                        if (scope.task.pinned === true) {
                                            scope.userTask.page = scope.task.page.name;
                                            scope.userTask.param = scope.task.page.param;
                                            scope.task.onWindowPinned(scope.task.page);
                                        } else {
                                            scope.userTask.page = "";
                                            scope.userTask.param = "";
                                        }

                                        if (scope.task.stateAjax) {
                                            scope.userTask.fluidId = scope.task.fluidId;
                                            scope.userTask.pinned = scope.task.pinned;
                                            saveTaskSate(scope.task, scope.userTask, f2, "pin");
                                        }

                                    };
                                    scope.task.fullScreen = function () {
                                        f.toggleFullscreen(scope.task);
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }
                                        task.showPageList = false;
                                    };
                                    scope.task.fluidScreen = function () {
                                        f.toggleFluidscreen();
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }
                                    };
                                    if (scope.task && !scope.fluidFrameService.fullscreen) {
                                        if (scope.task.size) {
                                            if (scope.task.size == '25') {
                                                scope.task.max25(true);
                                            } else if (scope.task.size == '50') {
                                                scope.task.max50(true);
                                            } else if (scope.task.size == '75') {
                                                scope.task.max75(true);
                                            } else if (scope.task.size == '100') {
                                                scope.task.max100(true);
                                            }
                                        }
                                    }
                                }


                                scope.task.open = function (index) {
                                    if (scope.task.active) {
                                        $(".frame-content").scrollTo($("div.panel[task]:eq(" + index + ")"), 200);
                                    } else {
                                        scope.task.active = true;
                                        t($(".frame-content").scrollTo($("div.panel[task]:eq(" + index + ")"), 200), 300)
                                    }
                                }


                                if (scope.fluidFrameService.fullScreen) {
                                    parent.addClass("col-lg-12");
                                    parent.removeClass("col-lg-9");
                                    parent.removeClass("col-lg-3");
                                    parent.removeClass("col-lg-6");
                                }


                            }

                        });

                        scope.$watch(function (scope) {
                            return (!scope.task.generic && scope.fluidFrameService.fullScreen);
                        }, function (fullScreen) {
                            if (fullScreen) {
                                autoSizePanel(scope.task);
                            }
                            if (scope.task.generic === false) {
                                scope.task.loaded = false;
                                var loadGetFn = function () {
                                    if (scope.task) {
                                        scope.task.preLoad();
                                        scope.task.preLoaded = true;

                                        scope.loadGet();
                                        if (scope.task.preLoaded) {
                                            scope.task.load();

                                            scope.task.loaded = true;
                                        }
                                        scope.task.postLoad();
                                    }
                                };

                                t(loadGetFn, 500);
                            }
                        });


                        scope.$watch(function (scope) {
                            return scope.task.showToolBar;
                        }, function (toolbar) {
                            console.debug("toolbar", toolbar);
                            console.debug("toolbar.fullScreen", scope.fluidFrameService.fullScreen);
                            if (scope.fluidFrameService.fullScreen) {
                                autoSizePanel(scope.task);
                            }
                        })


                        $(window).on("resize", function () {
                            if (scope) {
                                if (scope.fluidFrameService.fullScreen) {
                                    scope.fluidFrameService.getFrame().css("overflow", "hidden");
                                    autoSizePanel(scope.task);
                                }

                                var viewport = rs.viewport;

                                if (viewport === 'xs') {
                                    if (scope) {
                                        scope.task.showPageList = false;
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }
                                    }
                                } else if (viewport === 'sm') {
                                    if (scope) {
                                        scope.task.showPageList = false;
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }
                                    }
                                } else if (viewport === 'md') {
                                    if (scope) {
                                        fos.closeOption(scope.fluid.getElementFlowId('fluid_option'));
                                    }
                                } else if (viewport === 'lg') {
                                    if (scope) {
                                        fos.closeOption(scope.fluid.getElementFlowId('fluid_option'));
                                    }
                                }
                            }

                        });


                        element.ajaxStart(function () {
                            t(function () {
                                scope.task.loaded = false;
                                console.debug("ajax-" + scope.task.name + "started:", scope.task);
                            });
                        });

                        element.ajaxStop(function () {
                            t(function () {
                                scope.task.loaded = true;
                                console.debug("ajax-" + scope.task.name + "stopped:", scope.task);
                            });
                        })
                    }

                }

            }
        }
    ])
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
    .directive("fluidPanel", ["$templateCache", "FluidPanelModel", "fluidToolbarService", "$ocLazyLoad", "$compile", "fluidPanelService", "fluidFrameService", "$viewport", "$window",
        "$anchorScroll", "$location",
        function (tc, FluidPanel, ftb, oc, c, fluidPanelService, FluidFrame, v, window, a, l) {
            return {
                require: "^fluidFrame",
                scope: {task: "=", frame: "@"},
                restrict: "E",
                replace: true,
                template: tc.get("templates/fluid/fluidPanel.html"),
                link: {
                    pre: function (scope, element, attr) {

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

                        scope.loaded = function () {
                            if (scope.fluidPanel.frame.fullScreen) {
                                scope.fluidPanel.frame.$().scrollTop(0);
                                var maxHeight = element.parent().css("height");
                                console.debug("fluidPanel.fullScreen.maxHeight", maxHeight);
                                console.debug("fluidPanel.fullScreen.innerHeight", element.parent().innerHeight());
                                autoFullscreen(element, maxHeight.replace("px", ""), element.parent().innerWidth());
                            }
                            if (scope.fluidPanel.loaders) {
                                console.debug("fluidPanel-fluidPanel2.fluidPanel.loaders", scope.fluidPanel.loaders);
                                angular.forEach(scope.fluidPanel.loaders, function (load, $index) {
                                    load(this);
                                    scope.fluidPanel.loaders.splice($index, 1);
                                }, scope.fluidPanel);
                            }
                        }


                        scope.load = function () {
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
                                    scope.fluidPanel.loaded = false;
                                    scope.fluidPanel.frame = new FluidFrame(scope.frame);
                                    scope.$watch(function (scope) {
                                        return scope.fluidPanel.loaded;
                                    }, function (loaded) {
                                        if (loaded) {
                                            scope.loaded();
                                        }
                                    });
                                });
                            } else {
                                scope.fluidPanel = new FluidPanel(scope.task);
                                scope.fluidPanel.loaded = false;
                                scope.$watch(function (scope) {
                                    return scope.fluidPanel.loaded;
                                }, function (loaded) {
                                    if (loaded) {
                                        if (loaded) {
                                            scope.loaded();
                                        }
                                    }
                                });
                            }

                            element.on("load", function () {
                                scope.task.load(scope.task.ok, scope.task.cancel);
                            });
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
                            return scope.task.size;
                        }, function (newSize, oldSize) {
                            if (scope.fluidPanel) {
                                scope.fluidPanel.onSizeChange(newSize);
                            }
                            scope.setSize(newSize);
                        });


                    },
                    post: function (scope, element, attr) {

                        scope.getElementFlowId = function (id) {
                            return id + "_" + scope.fluidPanel.id;
                        }
                        scope.$on("$destroy", function () {

                            if (scope.fluidPanel && scope.fluidPanel.destroy) {
                                scope.fluidPanel.clear();
                                scope.fluidPanel.frame.fluidPanel[scope.fluidPanel.id] = undefined;
                            }
                        });


                        var frame = new FluidFrame(scope.frame);

                        if (frame.fullScreen) {
                            scope.$watch(function (scope) {
                                return scope.task;
                            }, function (newTask, oldTask) {
                                console.debug("fluid-panel.watch.oldTask", oldTask);
                                if (newTask.fluidId !== oldTask.fluidId) {
                                    console.debug("fluid-panel.watch.changeTask", newTask);
                                    scope.load();
                                } else {
                                    console.debug("fluid-panel.watch.newTask", newTask);
                                    scope.load();
                                }

                            });
                        } else {
                            scope.load();
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
    .factory("FluidPanelModel", ["TaskControl", "ToolBarItem", "fluidTaskService", "FluidBreadcrumb", "FluidPage", "$q", "fluidFrameService",
        function (TaskControl, ToolBarItem, TaskService, FluidBreadcrumb, FluidPage, q, FluidFrame) {
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
                } else {

                    var panel = this;
                    this.frame = frame;
                    this.task = task;
                    this.pages = [];
                    this.id = task.fluidId;
                    this.$ = function () {
                        return $("div#_id_fp_" + this.id)
                    }
                    this.$scope = angular.element(this.$).scope();
                    this.goTo = function (name, $event) {
                        var pg = this.pages[name];
                        if (pg != null) {
                            var fluidBreadcrumb = new FluidBreadcrumb(this);
                            var currentPage = this.pages[fluidBreadcrumb.currentPage()];
                            if (currentPage != null) {
                                currentPage.change(function () {
                                    fluidBreadcrumb.addPage(pg)
                                }, function () {
                                    //TODO: parent cancellation handling
                                }, $event);
                            } else {
                                fluidBreadcrumb.addPage(pg);
                            }

                        } else {
                            angular.forEach(task.pages, function (page) {
                                if (page.name === name) {
                                    var fluidPage = new FluidPage(page);
                                    var fluidBreadcrumb = new FluidBreadcrumb(this);
                                    var currentPage = this.pages[fluidBreadcrumb.currentPage()];
                                    this.pages[name] = fluidPage;
                                    if (currentPage != null) {
                                        currentPage.change(function () {
                                            fluidBreadcrumb.addPage(page);
                                        }, function () {
                                            //TODO: parent cancellation handling
                                        }, $event);
                                    } else {
                                        fluidBreadcrumb.addPage(page);
                                    }
                                }
                            }, this);
                        }
                    }
                    this.getPage = function (name) {
                        return this.pages[name];
                    }
                    this.prevPage = function ($event) {
                        var fluidBreadcrumb = new FluidBreadcrumb(this);
                        var page = this.pages[fluidBreadcrumb.currentPage()];
                        page.change(function () {
                            fluidBreadcrumb.previous()
                        }, function () {
                            //TODO: parent cancellation handling
                        }, $event);
                    }
                    this.nextPage = function ($event) {
                        var fluidBreadcrumb = new FluidBreadcrumb(this);
                        var page = this.pages[fluidBreadcrumb.currentPage()];
                        page.change(function () {
                            fluidBreadcrumb.next()
                        }, function () {
                            //TODO: parent cancellation handling
                        }, $event);
                    }
                    this.addControl = function (control) {
                        if (!this.controls) {
                            this.controls = [];
                        }
                        control.fluidPanel = this;
                        addItem(control, this.controls);
                    }
                    this.addToolbarItem = function (toolbarItem) {
                        if (!this.toolbarItems) {
                            this.toolbarItems = [];
                        }
                        toolbarItem.fluidPanel = this;
                        addItem(toolbarItem, this.toolbarItems);
                    }

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
                    }
                    this.addControl(closeControl);

                    var expandControl = new TaskControl();
                    expandControl.setId("expandPanel");
                    expandControl.glyph = "fa fa-expand";
                    expandControl.uiClass = "btn btn-info";
                    expandControl.label = "Fullscreen";
                    expandControl.action = function (task, $event) {
                        panel.onFullscreen(function () {
                            panel.frame.fullScreen = true;
                            panel.frame.task = task;
                        }, function () {

                        })

                    }
                    expandControl.visible = function () {
                        return !this.fluidPanel.frame.fullScreen;
                    }
                    this.addControl(expandControl);

                    var fluidScreenControl = new TaskControl();
                    fluidScreenControl.setId("fluidPanel");
                    fluidScreenControl.glyph = "fa fa-compress";
                    fluidScreenControl.uiClass = "btn btn-info";
                    fluidScreenControl.label = "Fluid";
                    fluidScreenControl.action = function (task, $event) {
                        panel.onFluidscreen(function () {
                            panel.frame.fullScreen = false;
                            panel.frame.task = undefined;
                        }, function () {

                        });
                    }
                    fluidScreenControl.visible = function () {
                        return this.fluidPanel.frame.fullScreen;
                    }
                    this.addControl(fluidScreenControl);

                    var minimizeControl = new TaskControl()
                    minimizeControl.setId("minimizePanel");
                    minimizeControl.glyph = "fa fa-caret-down";
                    minimizeControl.uiClass = "btn btn-info";
                    minimizeControl.label = "Minimize";
                    minimizeControl.action = function (task, $event) {
                        task.active = false;
                    }
                    minimizeControl.visible = function () {
                        return !this.fluidPanel.frame.fullScreen;
                    }
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
                    }
                    homeToolBarItem.setId("home_pnl_tool");
                    homeToolBarItem.visible = function () {
                        var breadcrumb = this.fluidPanel.fluidBreadcrumb;
                        var current = this.fluidPanel.pages[breadcrumb.currentPage()];
                        var firstPage = this.fluidPanel.pages[breadcrumb.pages[0]];

                        console.debug("fluidPanel-homeToolBarItem-visible.current", current);
                        console.debug("fluidPanel-homeToolBarItem-visible.firstPage", firstPage);
                        return (firstPage && firstPage.isHome) && (current && !current.isHome);
                    }
                    this.addToolbarItem(homeToolBarItem);

                    var backToolBarItem = new ToolBarItem();
                    backToolBarItem.glyph = "fa fa-arrow-left";
                    backToolBarItem.uiClass = "btn btn-info";
                    backToolBarItem.label = "Back";
                    backToolBarItem.action = function (task, $event) {
                        this.fluidPanel.prevPage($event);
                    }
                    backToolBarItem.disabled = function () {
                        var fluidBreadcrumb = new FluidBreadcrumb(this.fluidPanel);
                        return !fluidBreadcrumb.hasPrevious();
                    }
                    backToolBarItem.setId("back_pnl_tool");
                    this.addToolbarItem(backToolBarItem);

                    var nextToolBarItem = new ToolBarItem();
                    nextToolBarItem.glyph = "fa fa-arrow-right";
                    nextToolBarItem.uiClass = "btn btn-info";
                    nextToolBarItem.label = "Next";
                    nextToolBarItem.action = function (task, $event) {
                        this.fluidPanel.nextPage($event);
                    }
                    nextToolBarItem.disabled = function () {
                        var fluidBreadcrumb = new FluidBreadcrumb(this.fluidPanel);
                        return !fluidBreadcrumb.hasNext();
                    }
                    nextToolBarItem.setId("next_pnl_tool");
                    this.addToolbarItem(nextToolBarItem);

                    var refreshToolBarItem = new ToolBarItem();
                    refreshToolBarItem.glyph = "fa fa-refresh";
                    refreshToolBarItem.uiClass = "btn btn-info";
                    refreshToolBarItem.label = "Refresh";
                    refreshToolBarItem.action = function (task, $event) {
                        var page = this.fluidPanel.getPage(this.fluidPanel.fluidBreadcrumb.currentPage())
                        page.refresh(page.$scope.loadPage, function () {

                        }, $event);
                    }
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
                        }
                        fluidPage.close(function (data) {
                            pages.splice($index, 1);
                            if (breadcrumb.current > $index) {
                                breadcrumb.current -= 1;
                            } else if (breadcrumb.current === $index) {
                                breadcrumb.current -= 1;
                            }
                        }, function () {
                            breadcrumb.current = previous;
                        }, $event);
                    }
                    this.fluidBreadcrumb.open = function (page, $index, $event) {
                        panel.goTo(page, $event);
                    }

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
                                            panel.frame.fullScreen = false;
                                            panel.frame.removeTask(task);
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
                    }
                    this.clear = function () {
                        this.pages = [];
                        this.fluidBreadcrumb.pages = [];
                    }
                    this.onLoad = function (loadedAction) {
                        if (!this.loaders) {
                            this.loaders = [];
                        }
                        this.loaders.push(loadedAction);
                    }
                    this.onViewportChange = function (port) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        console.debug("fluidPanel-fluidPanelModel-onViewportChange.fluidBreadcrumb.currentPage", this.fluidBreadcrumb.currentPage());
                        console.debug("fluidPanel-fluidPanelModel-onViewportChange.page", page);
                        if (page) {
                            page.onViewportChange(port);
                        }
                    }

                    this.onSizeChange = function (size) {
                        var page = this.getPage(this.fluidBreadcrumb.currentPage());
                        if (page) {
                            page.onSizeChange(size);
                        }
                    }

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
                    }

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
                    }


                    frame.fluidPanel[this.id] = this;
                }
            }
            return fluidPanel;
        }])
    .service("fluidPanelService", ["$timeout", function (t) {
        this.fluidPanel = [];
        this.clear = function (id) {
            this.fluidPanel[id].clear();
            this.fluidPanel[id] = undefined;
        }
        var fluidPanel = this.fluidPanel;

        function check() {
            console.debug("fluidPanel-fluidPanelService.fluidPanel", fluidPanel);
            t(check, 1000);
        }

        return this;
    }]);

;/**
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
                } else {
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

                    t(function () {
                        if (ss.containsKey(key)) {
                            console.debug("fluidTask-fluidTaskService-findTaskByName-waitForTask.getSessionProperty", ss.getSessionProperty(key));
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
                    frame.task = task;
                } else {
                    $(".fluid-frame[name='" + frame.name + "']").scrollTo($("div.fluid-panel:eq(" + task.index + ")"), 200);
                    console.debug("fluid-task-task.open", "div.fluid-panel :eq(" + task.index + ")");
                }
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
    }]);;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidTool", [])
    .directive("fluidToolObselete", ["$rootScope", "$compile", "$templateCache", function (r, c, tc) {
        return {
            scope: {task: '=', controls: '=', pages: '=', fluid: "=", size: "@", fixed: '='},
            restrict: "E",
            replace: true,
            template: tc.get("templates/fluid/fluidToolbar.html"),
            link: function (scope, element, attr) {


                if (attr.size) {
                    if (attr.size === "small") {
                        scope.size = "btn-group-xs";
                    } else if (attr.size === "medium") {
                        scope.size = "btn-group-sm";
                    } else if (attr.size === "large") {
                        scope.size = "btn-group-md";
                    }
                } else {
                    scope.size = "btn-group-md";
                }
                scope.runEvent = function (control, $event) {
                    if (control.action) {
                        control.action($event);
                    } else {
                        var event = control.id + "_fp_" + scope.task.id;
                        r.$broadcast(event);
                    }

                };
                scope.goToEvent = function (name, param) {
                    scope.fluid.navTo(name);
                };
                scope.getClass = function (uiType) {
                    if (uiType.toLowerCase() === "info") {
                        return "btn-info";
                    } else if (uiType.toLowerCase() === "danger") {
                        return "btn-danger";
                    } else if (uiType.toLowerCase() === "warning") {
                        return "btn-warning";
                    } else if (uiType.toLowerCase() === "inverse") {
                        return "btn-inverse";
                    } else if (uiType.toLowerCase() === "success") {
                        return "btn-success";
                    } else if (uiType.toLowerCase() === "primary") {
                        return "btn-primary";
                    } else {
                        return "btn-default";
                    }
                }
            }
        }
    }])
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

    }]);;angular.module('templates-dist', ['templates/fluid/fluidBreadcrumb.html', 'templates/fluid/fluidFrame.html', 'templates/fluid/fluidLoader.html', 'templates/fluid/fluidOption.html', 'templates/fluid/fluidPage.html', 'templates/fluid/fluidPanel.html', 'templates/fluid/fluidPanelObselete.html', 'templates/fluid/fluidTaskIcon.html', 'templates/fluid/fluidTaskcontrols.html', 'templates/fluid/fluidTasknav.html', 'templates/fluid/fluidToolbar.html']);

angular.module("templates/fluid/fluidBreadcrumb.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidBreadcrumb.html",
    "<div class=\"fluid-breadcrumb\" ng-init=\"item=[]\">\n" +
    "    <div class=\"item hidden-xs hidden-sm hidden25\" ng-repeat=\"bread in breadcrumb.pages\" ng-class=\"item[$index].active\">\n" +
    "        <span ng-mouseover=\"item[$index].showClose=true && $index > 0;item[$index].active='hovered'\"\n" +
    "              ng-mouseleave=\"item[$index].showClose=false;item[$index].active='default'\">\n" +
    "            <span class=\"label\" ng-class=\"breadcrumb.current === $index ?'active':'inactive'\"\n" +
    "                  ng-click=\"breadcrumb.open(bread,$index,$event)\">{{breadcrumb.getTitle(bread)}}</span>\n" +
    "            <i ng-if=\"item[$index].showClose\" class=\"fa fa-close text-danger\" title=\"Close {{bread}}\"\n" +
    "               ng-click=\"breadcrumb.close(bread,$index,$event)\"></i>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"item-sm hidden-md hidden50 hidden75 hidden100 hidden-fullscreen-md hidden-fullscreen-lg\">\n" +
    "\n" +
    "        <span>{{breadcrumb.getTitle(breadcrumb.currentPage())}}</span>\n" +
    "\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("templates/fluid/fluidFrame.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidFrame.html",
    "<div class=\"fluid-frame\" ng-class=\"!frame.fullScreen ?'default-frame':'full'\">\n" +
    "    <bootstrap-viewport></bootstrap-viewport>\n" +
    "\n" +
    "    <fluid-panel ng-if=\"frame.fullScreen\" task='frame.task' frame=\"{{frame.name}}\" class=\"fullscreen\"\n" +
    "                 fluid-fullscreen-height></fluid-panel>\n" +
    "    <div ng-if=\"!frame.fullScreen\">\n" +
    "        <div class=\"fluid-frame-task\">\n" +
    "            <fluid-panel task=\"task\" frame=\"{{frame.name}}\"\n" +
    "                         ng-repeat='task in frame.tasks | filter:{active:true}'></fluid-panel>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/fluid/fluidLoader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidLoader.html",
    "<div>\n" +
    "<style>\n" +
    "    #{{getElementFlowId('followingBallsG')}} {\n" +
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
    "    }\n" +
    "\n" +
    "</style>\n" +
    "<div id=\"followingBallsG\">\n" +
    "    <span id=\"followingBallsG_1\" class=\"followingBallsG\">\n" +
    "    </span>\n" +
    "    <span id=\"followingBallsG_2\" class=\"followingBallsG\">\n" +
    "    </span>\n" +
    "    <span id=\"followingBallsG_3\" class=\"followingBallsG\">\n" +
    "    </span>\n" +
    "    <span id=\"followingBallsG_4\" class=\"followingBallsG\">\n" +
    "    </span>\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("templates/fluid/fluidOption.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidOption.html",
    "<div id=\"fluid_option\" class=\"fluid-option {{task.locked?'locked':''}}\">\n" +
    "    <div id=\"fluid_option_template\" class=\"fluid-option-template\"></div>\n" +
    "</div>");
}]);

angular.module("templates/fluid/fluidPage.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidPage.html",
    "<div class=\"fluid-page\" ng-class=\"!fluidPage.loaded ? 'default-page':''\">\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/fluid/fluidPanel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidPanel.html",
    "<div id='_id_fp'\n" +
    "     ng-class=\"!fluidPanel.frame.fullScreen ? 'panel panel-primary fluid-task ' + size : 'panel panel-default frame-fullscreen col-lg-12'\"\n" +
    "     class=\"fluid-panel\">\n" +
    "    <div ng-if=\"fluidPanel\" class=\"panel-heading\" ng-if=\"!task.locked\">\n" +
    "        <div class=\"panel-title\">\n" +
    "            <div class=\"left\">\n" +
    "\n" +
    "                <a ng-if=\"fluidPanel.loaded && !fluidPanel.frame.fullScreen\" href=\"#\" class=\"fluid-panel-heading-title\"\n" +
    "                   data-toggle=\"collapse\"\n" +
    "                   data-target=\"#collapse_{{task.fluidId}}\">\n" +
    "                    <fluid-task-icon class=\"hidden-xs hidden-sm hidden-md hidden25\"></fluid-task-icon>\n" +
    "                    <span>{{task.title}}</span>\n" +
    "                </a>\n" +
    "                <span ng-if=\"fluidPanel.loaded && fluidPanel.frame.fullScreen\" class=\"fluid-panel-heading-title\">\n" +
    "                    <fluid-task-icon\n" +
    "                            class=\"hidden-xs hidden-sm hidden-md hidden25\"></fluid-task-icon>\n" +
    "                    <span>{{task.title}}</span>\n" +
    "                </span>\n" +
    "\n" +
    "                <fluid-loader ng-if=\"!fluidPanel.loaded\" class=\"fluid-panel-loader\"></fluid-loader>\n" +
    "            </div>\n" +
    "            <fluid-breadcrumb ng-if=\"fluidPanel && fluidPanel.loaded\"\n" +
    "                              ></fluid-breadcrumb>\n" +
    "\n" +
    "            <fluid-taskcontrols class=\"controls\"></fluid-taskcontrols>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-if=\"fluidPanel\" id=\"collapse\" class=\"panel-collapse collapse in\">\n" +
    "        <div id=\"_id_fpb\" class=\"panel-body container-fluid\">\n" +
    "            <fluid-option></fluid-option>\n" +
    "            <fluid-message id=\"fluidPanelMsg\"></fluid-message>\n" +
    "            <fluid-tool ng-if=\"task.showToolBar\" class=\"width100pc\"></fluid-tool>\n" +
    "            <fluid-page id=\"fluid_page\"\n" +
    "                        page=\"fluidPanel.pages[fluidPanel.fluidBreadcrumb.currentPage()]\"\n" +
    "                        fluid-panel=\"fluidPanel\"\n" +
    "                        class=\"{{task.showToolBar ? 'toolbar':''}}\"></fluid-page>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <script ng-if=\"fluidPanel\" id=\"menu_option\" type=\"text/ng-template\">\n" +
    "        <div class=\"container-fluid\"></div>\n" +
    "    </script>\n" +
    "\n" +
    "</div>");
}]);

angular.module("templates/fluid/fluidPanelObselete.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidPanelObselete.html",
    "<div id='_id_fp_{{task.id}}' task\n" +
    "     class=\"panel {{!fluidFrameService.fullScreen ? 'panel-default fluid-task' : 'panel-default frame-fullscreen'}}\"\n" +
    "     task-origin-id=\"{{task.signature.id}}\" task-url=\"{{task.signature.url}}\">\n" +
    "\n" +
    "    <script id=\"{{fluid.getElementFlowId('pageList')}}\" type=\"text/ng-template\">\n" +
    "        <div class=\"input-group\">\n" +
    "            <input class=\"form-control\" ng-model=\"task.searchPage\" placeholder=\"Page\"/>\n" +
    "            <span class=\"input-group-addon\"><i class=\"fa fa-search\"></i></span>\n" +
    "        </div>\n" +
    "        <ul class=\"list-group\">\n" +
    "            <li class=\"list-group-item\"\n" +
    "                ng-repeat=\"page in task.pages | filter: {'title':task.searchPage} | filter: filterPage\"\n" +
    "                ng-click=\"fluid.goTo(page.name);fluid.closeOption()\"\n" +
    "                style=\"cursor: pointer\"\n" +
    "                ng-class=\"task.page.name == page.name ? 'active':''\">\n" +
    "                {{page.title}}\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </script>\n" +
    "\n" +
    "    <div class='panel-heading' ng-show=\"!task.locked\">\n" +
    "        <!-- Title-->\n" +
    "        <div class=\"panel-title\">\n" +
    "            <a ng-if=\"!fluidFrameService.fullScreen\" data-toggle='collapse'\n" +
    "               data-target='#_{{task.id}}'\n" +
    "               href='#'\n" +
    "               class=\"fluid-panel-heading-title\">\n" +
    "                <fluid-task-icon class=\"fluid-icon-left hidden-sm hidden-md hidden-xs\" task=\"task\"></fluid-task-icon>\n" +
    "                <span ng-if=\"task.loaded\" class=\"hidden25\">&nbsp;{{task.title}} - {{task.page.title}}</span></a>\n" +
    "            <span ng-if=\"task.loaded && fluidFrameService.fullScreen\">&nbsp;{{task.title}} - {{task.page.title}}</span>\n" +
    "            <fluid-loader class=\"{{!fluidFrameService.fullScreen ? 'fluid-panel-loader':''}}\"\n" +
    "                          ng-if=\"!task.loaded\"></fluid-loader>\n" +
    "        </div>\n" +
    "\n" +
    "        <!-- Control -->\n" +
    "        <div class=\"{{task.useImg ? 'panel-control-img': 'panel-control-glyph'}} pull-right\">\n" +
    "            <div class=\"btn-group btn-group-lg hidden-lg {{!task.useImg ?'fluid-icon-right-glyph':''}}\">\n" +
    "                <a href='#' class='dropdown-toggle' data-toggle='dropdown'>\n" +
    "                    <fluid-task-icon task=\"task\"\n" +
    "                                     class=\"{{!fluidFrameService.fullScreen ? '' : 'text-primary'}} fluid-panel-icon-control\"></fluid-task-icon>\n" +
    "                </a>\n" +
    "                <ul class='dropdown-menu dropdown-menu-right dropdown-menu-inverse'>\n" +
    "                    <li><a href='#' ng-click='task.refresh()'>Refresh</a></li>\n" +
    "                    <li class='divider hidden-lg hidden-sm hidden-xs'></li>\n" +
    "                    <li ng-if=\"!fluidFrameService.fullScreen\">\n" +
    "                        <a ng-click='task.fullScreen()'>Fullscreen</span></a>\n" +
    "                    </li>\n" +
    "                    <li ng-if='fluidFrameService.fullScreen'>\n" +
    "                        <a ng-click=\"task.fluidScreen()\">Fluidscreen</a>\n" +
    "                    </li>\n" +
    "                    <li class='hidden-lg'><a href='#' ng-click='task.hide(task)'>Minimize</a>\n" +
    "                    </li>\n" +
    "                    <li ng-if=\"task.closeable==undefined || task.closeable==true\" class='divider'></li>\n" +
    "                    <li ng-if=\"task.closeable==undefined || task.closeable==true\"><a\n" +
    "                            ng-class=\"task.locked ? 'hidden-sm hidden-md hidden-xs' : ''\" href='#'\n" +
    "                            ng-click='task.close()'>Close</a></li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "            <div class=\"hidden-md hidden-xs hidden-sm btn-group btn-group-xs {{fluidFrameService.fullScreen && !task.useImg ? 'panel-control-fullscreen' :''}}\n" +
    "             {{!fluidFrameService.fullScreen && !task.useImg ? 'panel-tools' :''}} {{!fluidFrameService.fullScreen && task.useImg ? 'panel-tools-img' :''}}\">\n" +
    "                <!-- ToDo: Allow panel to freeze. <button class='btn btn-info fa fa-paperclip' ng-click='freeze(task)'ng-class=\\\"task.freeze ? 'active' :''\\\" title='Clip'></button>-->\n" +
    "                <!-- <button ng-class=\"task.pinned ?\n" +
    "                         'active' :''\" title='Pin' type=\"button\" class=\"btn btn-info\" ng-click='task.pin()' >\n" +
    "                     <i class='fa fa-thumb-tack'title=\"Pin\"\n" +
    "                      ></i>\n" +
    "                 </button>-->\n" +
    "\n" +
    "                <button ng-hide='fluidFrameService.fullScreen' ng-disabled='task.pinned' type=\"button\"\n" +
    "                        class=\"btn btn-info\" ng-click='task.max25()' title=\"Maximize - 25\">\n" +
    "                    <i><span class='fa fa-arrows-h' style=\"transform: scaleX(0.8)\"></span></i>\n" +
    "                </button>\n" +
    "\n" +
    "                <button ng-hide='fluidFrameService.fullScreen' ng-disabled='task.pinned' title=\"Maximize - 50\"\n" +
    "                        class=\"btn btn-info\"\n" +
    "                        ng-click='task.max50()'>\n" +
    "                    <i class='element-center fa fa-arrows-h' style=\"transform: scaleX(0.9)\"></i>\n" +
    "                </button>\n" +
    "                <button ng-hide='fluidFrameService.fullScreen' ng-disabled='task.pinned' ng-click='task.max75()'\n" +
    "                        class=\"btn btn-info\">\n" +
    "                    <i title=\"Maximize - 75\"\n" +
    "                            ><span class='fa fa-arrows-h' style=\"transform: scaleX(1.1)\"></span></i>\n" +
    "                </button>\n" +
    "                <button ng-hide='fluidFrameService.fullScreen' ng-disabled='task.pinned' ng-click='task.max100()'\n" +
    "                        class=\"btn btn-info\">\n" +
    "                    <i title=\"Maximize - 100\" class='element-center fa fa-arrows-h' style=\"transform: scaleX(1.3)\"></i>\n" +
    "                </button>\n" +
    "                <button ng-disabled='task.pinned' title=\"Minimize\" ng-click='task.hide(task)'\n" +
    "                        class=\"btn {{fluidFrameService.fullScreen ? 'btn-default' : 'btn-info'}}\">\n" +
    "                    <i title='minimize'\n" +
    "                       class='element-center fa fa-angle-down'></i>\n" +
    "                </button>\n" +
    "                <button ng-if=\"!fluidFrameService.fullScreen\" class=\"btn btn-info\" ng-click='task.fullScreen()'>\n" +
    "                    <i title=\"Full screen\" class=\"element-center fa fa-expand\"></i>\n" +
    "                </button>\n" +
    "                <button ng-if='fluidFrameService.fullScreen'\n" +
    "                        class=\"btn {{fluidFrameService.fullScreen ? 'btn-default' : 'btn-info'}}\"\n" +
    "                        ng-click=\"task.fluidScreen()\">\n" +
    "                    <i title=\"Fluid screen\" class='element-center fa fa-th'></i>\n" +
    "                </button>\n" +
    "                <button class=\"btn {{fluidFrameService.fullScreen ? 'btn-default' : 'btn-info'}}\"\n" +
    "                        ng-click='task.refresh()'>\n" +
    "                    <i title=\"Refresh\" class=\"element-center fa \"\n" +
    "                       ng-class=\"task.loaded ? 'fa-refresh' : 'fa-spin fa-refresh'\"></i>\n" +
    "                </button>\n" +
    "                <button ng-if=\"task.closeable==undefined || task.closeable==true\"\n" +
    "                        class=\"btn {{fluidFrameService.fullScreen ? 'btn-default' : 'btn-danger'}}\"\n" +
    "                        ng-disabled='task.pinned||task.locked' ng-click='task.close()'>\n" +
    "                    <i class='element-center fa fa-close' title=\"Close\"\n" +
    "                       title='close'></i>\n" +
    "                </button>\n" +
    "\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div id='_{{task.id}}' class='panel-collapse collapse in'>\n" +
    "        <div id='_id_fpb_{{task.id}}' class=\"panel-body fluid-panel container-fluid\" ng-disabled='!task.loaded'>\n" +
    "            <fluid-option></fluid-option>\n" +
    "            <fluid-message id=\"{{fluid.get('pnl_msg')}}\"></fluid-message>\n" +
    "\n" +
    "            <fluid-tool size=\"large\" fluid=\"fluid\"\n" +
    "                        id=\"{{fluid.getElementFlowId('flw_tl')}}\"\n" +
    "                        ng-if='task.showToolBar' controls='toolbars'\n" +
    "                        task='task' pages='task.navPages'></fluid-tool>\n" +
    "            <div class=\"hidden50 fluid-page-list\"\n" +
    "                 ng-class=\"task.showPageList && showList()?'fluid-panel-page-list col-lg-3 col-md-3': 'fluid-panel-page-list-hidden'\">\n" +
    "\n" +
    "                <div ng-if=\"task.showPageList && showList()\" class=\"input-group\">\n" +
    "                    <input class=\"form-control\" ng-model=\"task.searchPage\" placeholder=\"Page\"/>\n" +
    "                    <span class=\"input-group-addon\"><i class=\"fa fa-search\"></i></span>\n" +
    "                </div>\n" +
    "\n" +
    "                <ul ng-if=\"task.showPageList && showList()\" class=\"list-group\">\n" +
    "                    <li class=\"list-group-item\"\n" +
    "                        ng-repeat=\"page in task.pages |  filter: {'title':task.searchPage} | filter: filterPage\"\n" +
    "                        ng-click=\"fluid.goTo(page.name)\"\n" +
    "                        style=\"cursor: pointer\"\n" +
    "                        ng-class=\"task.page.name == page.name ? 'active':''\">\n" +
    "                        {{page.title}}\n" +
    "                    </li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "            <div class=\"fluid-panel-content\" ng-class=\"task.showPageList ? 'col-lg-9 col-md-9':'col-lg-12 col-md-12'\">\n" +
    "                <div ng-if='task.pageLoaded' id='page_div_{{task.id}}'\n" +
    "                     class=\"fluid-panel-page animated {{task.pageTransition ? task.pageTransition : 'fadeIn'}}\"\n" +
    "                     ng-include='fluidPageService.renderPage(task,fluid).home'></div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/fluid/fluidTaskIcon.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidTaskIcon.html",
    "<span class=\"fluid-task-icon\">\n" +
    "    <img ng-if=\"task.useImg\" width=\"{{width? width:15}}\" height=\"{{height?height:15}}\" ng-src=\"{{task.imgSrc}}\">\n" +
    "    <i ng-if=\"!task.useImg\" ng-class=\"task.glyph\"></i>\n" +
    "</span>");
}]);

angular.module("templates/fluid/fluidTaskcontrols.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidTaskcontrols.html",
    "<span class=\"fluid-taskcontrols\">\n" +
    "      <div class=\"hidden-xs hidden-sm hidden-md hidden25 btn-group btn-group-xs\">\n" +
    "          <button id=\"{{control.getId($index)}}\" type=\"button\" ng-if=\"control.visible()\" ng-disbabled=\"control.disabled()\"\n" +
    "                  class=\"{{control.uiClass}}\"\n" +
    "                  ng-repeat=\"control in fluidPanel.controls| reverse\"\n" +
    "                  ng-class=\"control.class\"\n" +
    "                  ng-click=\"control.action(task,$event)\"><i class=\"{{control.glyph}} control-glyph\"></i></button>\n" +
    "      </div>\n" +
    "      <div class=\"hidden-fullscreen-lg hidden100 hidden50 hidden75 btn-group btn-group-xs small\">\n" +
    "          <a href=\"#\" class=\"icon dropdown-toggle fa-inverse\" data-toggle='dropdown'>\n" +
    "              <fluid-task-icon task=\"task\"></fluid-task-icon>\n" +
    "          </a>\n" +
    "          <ul class='dropdown-menu dropdown-menu-right dropdown-menu-inverse'>\n" +
    "              <li id=\"{{control.getId($index)}}\" ng-repeat=\"control in fluidPanel.controls| reverse\"\n" +
    "                  ng-if=\"control.visible() || control.disabled()\"\n" +
    "                  ng-class=\"control.class\">\n" +
    "                  <a href=\"#\" ng-click=\"control.action(task,$event)\">{{control.label}}</a>\n" +
    "              </li>\n" +
    "          </ul>\n" +
    "      </div>\n" +
    "</span>\n" +
    "\n" +
    "");
}]);

angular.module("templates/fluid/fluidTasknav.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidTasknav.html",
    "<div id class=\"fluid-tasknav\">\n" +
    "    <div class=\"input-group\"><input ng-model=\"navSearch\" class=\"form-control\" placeholder=\"Search here\">\n" +
    "\n" +
    "        <div class=\"input-group-addon\"><i class=\"fa fa-search\"></i></div>\n" +
    "    </div>\n" +
    "    <table class=\"table table-responsive\">\n" +
    "        <tbody ng-repeat=\"group in fluidTasknav.groups\" ng-if=\"!group.empty\">\n" +
    "        <tr class=\"group\" ng-init=\"group.show = $index == 0 ? true : false\" ng-click=\"group.show=!group.show\">\n" +
    "            <td>\n" +
    "                <span class=\"pull-left hidden-sm hidden-xs\">{{group.title}}</span>\n" +
    "            </td>\n" +
    "        </tr>\n" +
    "        <tr ng-if=\"group.show\" id=\"group_{{group.name}}_panel\" ng-animate=\"{enter:'slideInDown', leave:'slideOutUp'}\">\n" +
    "            <td ng-repeat=\"item in group.tasks | filter: navSearch\"\n" +
    "                ng-init=\"getTask(item); item.count = 0;\" class=\"task-item\">\n" +
    "                <div class=\"item-title\" ng-click=\"fluidTasknav.getFrameService().openTask(item.name)\">\n" +
    "                    <span class=\"pull-left icon\">\n" +
    "                        <img ng-if=\"item.useImg\" src=\"{{item.imgSrc}}\" width=\"25\" height=\"25\">\n" +
    "                        <i ng-if=\"!item.useImg\" ng-class=\"item.glyph\"></i>\n" +
    "\n" +
    "                    </span>\n" +
    "                    <span class=\"pull-left hidden-sm hidden-xs\">{{item.title}}</span>\n" +
    "                    <span class=\"pull-right\"> <span ng-if=\"item.count > 1\" class=\"badge\">{{item.count}}</span></span>\n" +
    "                </div>\n" +
    "                <div ng-repeat=\"task in fluidTasknav.getFrameService().tasks | filter : {name:item.name}\"\n" +
    "                     ng-init=\"item.count = ($index + 1)\"\n" +
    "                     class=\"item-task\" ng-mouseover=\"task.showControl=true\" ng-mouseleave=\"task.showControl=false\">\n" +
    "                    <div class=\"task-header\">\n" +
    "                        <span class=\"pull-left\"><i class=\"indicator\" ng-if=\"task.active\"\n" +
    "                                                   ng-class=\"getPanel(task).loaded ?'text-success fa fa-circle':'fa fa-spinner fa-spin'\"></i>{{task.title}}</span>\n" +
    "                    <span ng-if=\"task.showControl\" class=\"hidden-sm hidden-xs pull-right controls\">\n" +
    "                        <i class=\"hidden-md fa fa-gear text-success\" ng-click=\"task.showSetting=!task.showSetting\"></i>\n" +
    "                        <i class=\"fa fa-close text-danger\"\n" +
    "                           ng-click=\"getPanel(task).close(task, $event, item);\"></i>\n" +
    "                    </span>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <div ng-init ng-if=\"task.showSetting\" class=\"settings\"\n" +
    "                         ng-animate=\"{enter:'slideInDown', leave:'slideOutUp'}\">\n" +
    "                        <ul class=\"list-group\">\n" +
    "                            <li class=\"list-group-item list-group-item-heading list-group-item-info\"\n" +
    "                                ng-click=\"task.showPages=!task.showPages\">Pages\n" +
    "                            </li>\n" +
    "                            <li ng-if=\"task.showPages\" class=\"list-group-item\" ng-repeat=\"page in task.pages\"\n" +
    "                                ng-click=\"getPanel(task).goTo(page.name,$event)\">{{page.title}}\n" +
    "                            </li>\n" +
    "                            <li ng-click=\"task.showSizes=!task.showSizes\"\n" +
    "                                class=\"list-group-item list-group-item-heading list-group-item-info\">Size\n" +
    "                            </li>\n" +
    "                            <li ng-if=\"task.showSizes\" class=\"list-group-item\" ng-click=\"task.size=25\">25%</li>\n" +
    "                            <li ng-if=\"task.showSizes\" class=\"list-group-item\" ng-click=\"task.size=50\">50%</li>\n" +
    "                            <li ng-if=\"task.showSizes\" class=\"list-group-item\" ng-click=\"task.size=75\">75%</li>\n" +
    "                            <li ng-if=\"task.showSizes\" class=\"list-group-item\" ng-click=\"task.size=100\">100%</li>\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </td>\n" +
    "\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "</div>");
}]);

angular.module("templates/fluid/fluidToolbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidToolbar.html",
    "<div class=\"fluid-toolbar\">\n" +
    "    <div class=\"btn-group btn-group-sm hidden-xs hidden-sm hidden-md\" ng-if=\"fluidPanel && fluidPanel.toolbarItems && fluidPanel.toolbarItems.length > 0\">\n" +
    "        <button id=\"{{control.getId($index)}}\" ng-if=\"control.visible()\" ng-disabled=\"control.disabled()\" class=\"{{control.class}}\"\n" +
    "                ng-repeat=\"control in fluidPanel.toolbarItems\"\n" +
    "                ng-class=\"control.uiClass\"\n" +
    "                type=\"{{control.type}}\" title=\"{{control.label}}\"\n" +
    "                ng-click=\"control.action(task,$event)\"><i class=\"{{control.glyph}}\"></i>{{control.showText ?\n" +
    "            control.label : ''}}\n" +
    "        </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"btn-group btn-group-md hidden-lg\" role=\"toolbar\" ng-if=\"fluidPanel && fluidPanel.toolbarItems && fluidPanel.toolbarItems.length > 0\">\n" +
    "        <button id=\"{{control.getId($index)}}\" ng-if=\"control.visible()\" ng-disabled=\"control.disabled()\" class=\"{{control.class}}\"\n" +
    "                ng-repeat=\"control in fluidPanel.toolbarItems\"\n" +
    "                ng-class=\"control.uiClass\"\n" +
    "                type=\"{{control.type}}\" title=\"{{control.label}}\"\n" +
    "                ng-click=\"control.action(task,$event)\"><i class=\"{{control.glyph}}\"></i>{{control.showText ?\n" +
    "            control.label : ''}}\n" +
    "        </button>\n" +
    "    </div>\n" +
    "</div>");
}]);
