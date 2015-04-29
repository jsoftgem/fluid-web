/**Fluid Web v0.0.1
 * Created by Jerico de Guzman
 * October 2014**/
'use strict';

var fluidComponents = angular.module("fluid", ["oc.lazyLoad", "LocalStorageModule", "templates-dist", "ngSanitize", "fluidSession",
    "fluidHttp", "fluidFrame", "fluidMessage", "fluidOption", "fluidTool", "fluidPage", "fluidPanel","fluidTasknav"]);

fluidComponents.config(["$httpProvider", "localStorageServiceProvider", function (h, ls) {
    ls.setPrefix("fluid")
        .setStorageType("sessionStorage")
        .setNotify(true, true);
    h.interceptors.push("fluidInjector");
}]);

fluidComponents.run([function () {
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
                console.info("permissionEnabled-url", f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method);

                var url = f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method;

                var enabled = ss.getSessionProperty(url);

                console.info("permissionEnabled", enabled);

                if (enabled !== null) {
                    console.info("permissionEnabled-old", enabled);
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
                    console.info("permissionEnabled-new");
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
                console.info("permissionVisible-url", f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method);

                var url = f.permissionUrl + "?pageName=" + scope.page.name + "&method=" + scope.method;

                var visible = ss.getSessionProperty(url);

                console.info("permissionVisible", visible);

                if (visible !== null) {
                    console.info("permissionVisible-old", visible);

                    if (visible === 'false') {
                        element.addClass("hidden");
                        console.info("permissionVisible-hidden");
                    } else {
                        console.info("permissionVisible-visible");
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
                        console.info("column-old", oldColumn);
                        console.info("column", column);
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

                    console.info("column-size", size);
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
    .factory("fluidInjector", ["$q", "$rootScope", "sessionService", "fluidLoaderService", "responseEvent", function (q, rs, ss, fls, r) {

        return {
            "request": function (config) {
                if (fls.enabled) {
                    fls.loaded = false;
                }

                config.headers["Access-Control-Allow-Origin"] = "*";

                if (config.headers['fluid-container-id'] !== undefined) {
                    // $('#' + config.headers['fluid-container-id']).loadingOverlay();
                }
                if (ss.isSessionOpened()) {
                    config.headers['Authorization'] = ss.getSessionProperty(AUTHORIZATION);
                }
                return config;
            }
            ,
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
                            console.info("hidden50-viewport", rs.viewport);
                            console.info("hidden50-size", scope.task.size);
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
                            console.info("hidden100-viewport", rs.viewport);
                            console.info("hidden100-size", scope.task.size);
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
    }]);

/**Prototypes**/
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
    console.info("estimatedFrameHeight.getHeadingHeight",getHeadingHeight());
    var _pc = window.innerWidth < 450 ? 60 : window.innerWidth < 768 ? 60 : window.innerWidth < 1200 ? 65 : 50;
    return height - _pc
}

//TODO: body height
function getHeadingHeight(){
    var height = 0;
    $("body").children().each(function(){
        if(!$(this).hasClass("frame-content")){
            height+=$(this).outerHeight();
        }else{
            return false;
        }
    });

    return height;
}



function generateTask(scope, t, f2) {
    console.info("generateTask > scope.task.page", scope.task.page);
    scope.task.pageLoaded = false;
    if (scope.task.page === undefined || scope.task.page === null) {
        if (scope.task.pages) {
            var $page = getHomePageFromTaskPages(scope.task);
            scope.task.page = $page.page;
            scope.homeUrl = $page.page.get;
            scope.home = $page.page.name;
            scope.task.navPages = [$page.page];
            console.info("page", scope.task.page);
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
            console.info("homeUrl", scope.homeUrl);
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
    console.info("new_task", scope.task);
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
    console.info("autoSizePanel", task);
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


    console.info("autoSizePanel.bodyHeight", bodyHeight);


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
                        fluidOptionScope.close();
                    }
                }


            }
        });
    });

});;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidFrame", ["fluidHttp"])
    .directive("fluidFrame", ["fluidFrameService", "$window", "$rootScope", "$timeout", "$templateCache", function (f, w, rs, t, tc) {
        return {
            restrict: "AE",
            transclude: true,
            scope: true,
            template: tc.get("templates/fluid/fluidFrame.html"),
            replace: true,
            link: function (scope, element) {

                scope.frame = {};
                scope.fluidFrameService = f;
                scope.$watch(function (scope) {
                    return scope.fluidFrameService.fullScreen;
                }, function (fullScreen) {

                    var frameDiv = $(element.find("div.form-group")[1]);

                    if (!fullScreen) {
                        var height = window.innerHeight;
                        height = estimatedFrameHeight(height);
                        var frameHeight = height;
                        if (scope.fluidFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + frameHeight + "px;overflow:auto");
                        } else {
                            element.attr("style", "height:" + frameHeight + "px;overflow:auto");
                        }
                        $("body").attr("style", "height: " + window.innerHeight + "px;overflow:hidden");
                    } else {
                        var height = window.innerHeight;
                        height = estimatedFrameHeight(height);
                        var frameHeight = height;
                        if (scope.fluidFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                        } else {
                            element.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                        }
                        $("body").attr("style", "height: " + window.innerHeight + "px;overflow:hidden");
                    }
                });


                scope.show = function (task) {
                    if (!task.pinned) {
                        task.active = !task.active;
                    }
                };

                $(window).on("resize", function () {
                    if (scope) {
                        if (!scope.fluidFrameService.fullScreen) {
                            var height = window.innerHeight;
                            height = estimatedFrameHeight(height);
                            var frameHeight = height;
                            if (scope.fluidFrameService.isSearch) {
                                frameDiv.attr("style", "height:" + frameHeight + "px;overflow:auto");
                            } else {
                                element.attr("style", "height:" + frameHeight + "px;overflow:auto");
                            }
                        } else {
                            var height = window.innerHeight;
                            height = estimatedFrameHeight(height);
                            if (scope.fluidFrameService.isSearch) {
                                frameDiv.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                            } else {
                                element.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                            }
                        }

                        $("body").attr("style", "height: " + window.innerHeight + "px;overflow:hidden");
                    }
                });


                scope.initTask = function (task) {
                    if (task) {
                        scope.$watch(function () {
                            return task.active;
                        }, function (newValue, oldValue) {
                            if (true === newValue) {
                                if (task.onWindowOpening) {
                                    task.onWindowOpened();
                                } else {
                                    task.active = false;
                                }
                            }

                        });
                    }
                }
            }
        };
    }])
    .service("fluidFrameService", ["fluidHttpService", "$timeout", function (f, t) {
        this.isSearch = false;
        this.searchTask = "";
        this.taskUrl = "services/fluid_task_service/getTask?name=";
        this.fullScreen = false;
        if (this.taskList === undefined) {
            this.taskList = [];
        }
        this.pushTask = function (task) {
            task.generic = true;
            this.taskList.push(task);
        };

        this.addTask = function (url, origin, newTask) {
            //TODO: remove newTask

            var genericTask = this.createGenericTask();

            genericTask.origin = origin;

            this.taskList.push(genericTask);

            genericTask.index = this.taskList.length - 1;

            genericTask.url = url;

            var index = this.taskList.length - 1;

            if (this.fullScreen) {
                this.toggleFluidscreen();
            }

            t(function () {
                $(".frame-content").scrollTo($("div.panel[task]:eq(" + index + ")"), 200);
            }, 300);
        };
        this.toggleSearch = function () {
            this.isSearch = !this.isSearch;
            if (this.isSearch === false) {
                this.searchTask = "";
            }
        };
        this.toggleFullscreen = function (task) {
            this.fullScreen = true;
            this.fullScreenTask = task;
            t(function () {
                $(".frame-content").scrollTop(0);
            });
        };
        this.toggleFluidscreen = function () {
            this.fullScreen = false;
            this.fullScreenTask = undefined;
        };
        this.getFullTask = function (task) {
            console.info("getFullTask", task);
            var fullScreenTask = undefined;

            if (task) {
                var fullScreenTask = this.createGenericTask();

                fullScreenTask.url = this.taskUrl + task.name;
                fullScreenTask.size = 100;
            }

            return fullScreenTask;
        };
        this.createGenericTask = function () {

            var genericTask = Task();

            genericTask.id = "gen_id_";

            var countGeneric = 0;

            angular.forEach(this.taskList, function (task) {
                if ((task.id + "").indexOf("gen_id_") > -1) {
                    countGeneric++;
                }
            });

            genericTask.id = genericTask.id + "" + countGeneric;


            genericTask.size = 50;

            genericTask.active = true;

            genericTask.glyph = "fa fa-tasks";

            genericTask.title = "...";

            genericTask.generic = true;


            return genericTask;
        };
        this.getFrame = function () {
            return $("div.frame-content.frame-fullscreen");
        }
        this.buildTask = function (task) {

            /* Task event */
            task.preLoad = function () {
            };
            task.load = function () {
            };
            task.postLoad = function () {
            }
            task.onWindowClosing = function (page) {
                return true;
            }
            task.onWindowHiding = function (page) {
                return true;
            }
            task.onWindowOpening = function () {
                return true;
            }
            task.onWindowOpened = function () {
            }
            task.onWindowPinned = function (page) {

            }
            task.onWindowActive = function (page) {
            }

            return task;
        }
        this.showActionBar = function () {
            this.actionBarClass = "animated slideInUp";
            this.actionBarShowing = true;
        };
        this.hideActionBar = function () {
            this.actionBarClass = "animated slideOutDown";
            this.actionBarShowing = false;
        };
        return this;

    }]);;/**
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

            console.info("fluid-http-server-cache-session-value", sessionValue);

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
                console.info("fluid-http-server-new-session-key", key);
                console.info("fluid-http-server-new-session-value", data);
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

                scope.$watch(function (scope) {
                    return element.parent().height();
                }, function (height) {
                    scope.parentHeight = height;
                    var template = element.find(".fluid-option-template");
                    template.css("width", element.parent().width());
                    element.css("width", element.parent().width());

                });

                scope.close = function () {
                    fos.closeOption(element.attr("id"));
                }

                $(w).on("resize", function () {
                    var template = element.find(".fluid-option-template");
                    template.css("width", element.parent().width());
                    element.css("width", element.parent().width());
                });


            }
        }
    }])
    .service("fluidOptionService", ["$compile", function (c) {

        this.openOption = function (optionId, template, source) {
            console.info("fluidOptionService-openOption-source", source);

            var fluidOption = $("#" + optionId);
            var content = $("#" + template);
            var fluidScope = angular.element(fluidOption).scope();
            var fluidTemplate = fluidOption.find(".fluid-option-template");
            var fluidBottom = fluidOption.find(".fluid-option-bottom");
            var contentScope = angular.element(content).scope();
            var sourceID = $(source).attr("id");

            console.info("fluidOptionService-openOption-pre-sourceID", sourceID);

            if (!sourceID) {
                var eventSourceCount = $("[id*='_event_source_id']").length;
                sourceID = fluidOption.attr("id") + "_event_source_id_" + eventSourceCount;
                $(source).attr("id", sourceID);
            }

            console.info("fluidOptionService-openOption-sourceID", sourceID);

            fluidOption.css("max-height", fluidScope.parentHeight);

            fluidTemplate.css("max-height", fluidScope.parentHeight - 15);

            fluidOption.attr("source-event", sourceID);

            fluidBottom.removeClass("hidden")

            c(fluidTemplate.html(content.html()))(contentScope);

        }

        this.closeOption = function (optionId) {
            var fluidOption = $("#" + optionId);
            var fluidTemplate = fluidOption.find(".fluid-option-template");
            var fluidBottom = fluidOption.find(".fluid-option-bottom");
            fluidOption.css("max-height", 0);
            fluidTemplate.css("max-height", 0);
            fluidOption.removeAttr("source-event");
            fluidBottom.addClass("hidden");
        }

    }]);
;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPage", ["fluidHttp"])
    .service("fluidPageService", ["$templateCache", "fluidHttpService", function (tc, fhs) {

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

        return this;
    }]);
;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPanel", ["oc.lazyLoad", "fluidHttp", "fluidFrame", "fluidMessage", "fluidOption", "fluidSession", "fluidTool", "fluidPage"])
    .directive("fluidPanel", ["fluidFrameService", "fluidHttpService", "$templateCache", "$compile",
        "fluidMessageService", "$rootScope", "$q", "$timeout", "$ocLazyLoad", "sessionService", "fluidOptionService", "fluidPageService",
        function (f, f2, tc, c, ms, rs, q, t, oc, ss, fos, fps) {
            return {
                scope: {task: '='},
                restrict: "E",
                template: tc.get("templates/fluid/fluidPanel.html"),
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

                        console.info("fullScreen", scope.fluidFrameService.fullScreen);
                        console.info("fluidPanel-task", scope.task);
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
                                        console.info("showPageList-event", $event);
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
                        /*   scope.fluid.pageCallBack = function (page, data) {
                         console.info("generic callBack", page);
                         };*/
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
                        scope.fluid.openTaskBaseUrl = "services/fluid_task_service/getTask?";
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
                            console.info("openTask", url);

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
                            //adds control for page
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

                            console.info("autoget-page", scope.task.page);
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
                                    console.info("auto-get-url", url);
                                    f2.get(url, scope.task)
                                        .success(function (data) {
                                            console.info("autoget", data);
                                            resolve({page: scope.task.page.name, value: data});
                                        });
                                } else if ((scope.task.page !== undefined && scope.task.page !== null) && (!scope.task.page.autoGet || scope.task.page.autoGet === null || scope.task.page.autoGet === false)) {
                                    scope.task.currentPage = scope.task.page.name;
                                    console.info("autoget false", false);
                                    resolve({page: scope.task.page.name});
                                }
                            }).then(function (data) {
                                scope.task.pageLoaded = true;
                                var pagePanel = element.find(".fluid-panel-page");
                                console.info("page-panel", pagePanel);
                                console.info("page-panel-task", scope.task);
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

                                        /*if (scope.task.page.load) {
                                         scope.task.page.load(data.value);
                                         }*/

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
                            console.info("getToPage", scope.task.pages);
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
                            console.info("goTo", name);
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

                        /*********************/

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
                                                console.info("fluid-panel-base-task-cache", scope.baseTask);
                                                var newTask = scope.task.newTask;
                                                var $task = {};
                                                scope.copy = {};
                                                angular.copy(scope.task, scope.copy);
                                                console.info("fluid-panel-cache-task", scope.baseTask);

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
                                                console.info("fluid-panel-base-task-new", scope.baseTask);
                                                f2.get(scope.task.url, scope.task).success(function (d) {
                                                    ss.addSessionProperty(scope.task.url, d);
                                                    var newTask = scope.task.newTask;
                                                    var $task = {};
                                                    scope.copy = {};
                                                    angular.copy(scope.task, scope.copy);
                                                    console.info("generated-taskp", d);
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
                                                    console.info("task-initialization-finished", scope.task);
                                                    console.info("generated-task-pages", scope.task.pages);
                                                });
                                            }

                                        }

                                        scope.task.signature = {id: taskId, url: taskUrl};
                                    }
                                }

                            }
                        );

                        /*********************/

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

                        /*scope.$on(scope.fluid.event.getPageCallBackEventId, function (event, page, data) {
                         scope.fluid.pageCallBack(page, data);
                         });*/

                        scope.$on(EVENT_NOT_ALLOWED + scope.task.id, function (event, msg) {
                            scope.fluid.message.danger(msg);
                            angular.forEach(scope.task.navPages, function (page, key) {

                                if (page.name === scope.task.navPages.name) {
                                    scope.task.navPages.splice(key, 1);
                                    scope.fluid.goTo(scope.task.prevPage.name);
                                }
                            });

                        });

                        /*******************/


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
                            console.info("toolbar", toolbar);
                            console.info("toolbar.fullScreen", scope.fluidFrameService.fullScreen);
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
                                console.info("ajax-" + scope.task.name + "started:", scope.task);
                            });
                        });

                        element.ajaxStop(function () {
                            t(function () {
                                scope.task.loaded = true;
                                console.info("ajax-" + scope.task.name + "stopped:", scope.task);
                            });
                        })


                        /********************/
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

        this.logout = function () {
            if (this.isSessionSupported) {
                ls.clearAll();
            } else {
                ls.cookie.clearAll();
            }
        }

    }]);
;/**
 * Created by jerico on 4/29/2015.
 */
angular.module("fluidTasknav", ["fluidHttp", "fluidSession"])
    .directive("fluidTasknav", ["$templateCache", "sessionService", "fluidHttpService", function (tc, ss, fhs) {
        return {
            restrict: "AE",
            scope: false,
            template: tc.get("templates/fluid/fluid-tasknav.html"),
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


            }
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
    }]);;/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidTool", [])
    .directive("fluidTool", ["$rootScope", "$compile", "$templateCache", function (r, c, tc) {
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
    }]);;angular.module('templates-dist', ['templates/fluid/fluid-tasknav.html', 'templates/fluid/fluidFrame.html', 'templates/fluid/fluidLoader.html', 'templates/fluid/fluidOption.html', 'templates/fluid/fluidPanel.html', 'templates/fluid/fluidTaskIcon.html', 'templates/fluid/fluidToolbar.html']);

angular.module("templates/fluid/fluid-tasknav.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluid-tasknav.html",
    "<nav id class=\"fluid-tasknav\">\n" +
    "    <fluid-loader ng-if=\"loaded == undefined || loaded == true\"></fluid-loader>\n" +
    "\n" +
    "</nav>");
}]);

angular.module("templates/fluid/fluidFrame.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidFrame.html",
    "<div class=\"container-fluid frame-content\"\n" +
    "     ng-class=\"fluidFrameService.fullScreen ? 'frame-fullscreen' : 'frame-fluidscreen'\">\n" +
    "\n" +
    "    <bootstrap-viewport></bootstrap-viewport>\n" +
    "    <div ng-if=\"fluidFrameService.fullScreen\" class=\"frame-content-div\" column=\"12\"\n" +
    "         ng-show=\"fluidFrameService.fullScreen\" style=\"padding: 0;\">\n" +
    "        <fluid-panel task='fluidFrameService.fullScreenTask'></fluid-panel>\n" +
    "    </div>\n" +
    "    <div ng-if=\"!fluidFrameService.fullScreen\" class=\"container-fluid frame-content-div fluid-frame-div\"\n" +
    "         ng-hide=\"fluidFrameService.fullScreen\">\n" +
    "        <div ng-init=\"initTask(task)\" class=\"fluid-panel-transition fluid-frame-task\"\n" +
    "             ng-repeat='task in fluidFrameService.taskList | filter:{active:true, title:fluidFrameService.searchTask}'>\n" +
    "            <fluid-panel task='task'></fluid-panel>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"fluid-footer panel panel-primary\" ng-show=\"fluidFrameService.actionBarShowing\"\n" +
    "         ng-class=\"fluidFrameService.actionBarClass\">\n" +
    "        <div class=\"panel-heading\">\n" +
    "            <div class=\"tools\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"panel-body\">\n" +
    "            body\n" +
    "        </div>\n" +
    "        <!--<div class=\"pull-right\">Powered by <a href=\"#www.jsofttechnologies.com\">JSoft Technologies</a> of GEM</div>-->\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/fluid/fluidLoader.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidLoader.html",
    "<div>\n" +
    "<style>\n" +
    "    #{{fluid.getElementFlowId('followingBallsG')}} {\n" +
    "        position:relative;\n" +
    "        width:205px;\n" +
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
    "    #{{fluid.getElementFlowId('followingBallsG_1')}} {\n" +
    "        -moz-animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{fluid.getElementFlowId('followingBallsG_1')}} {\n" +
    "        -webkit-animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{fluid.getElementFlowId('followingBallsG_1')}} {\n" +
    "        -ms-animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{fluid.getElementFlowId('followingBallsG_1')}} {\n" +
    "        -o-animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{fluid.getElementFlowId('followingBallsG_1')}} {\n" +
    "        animation-delay:0s;\n" +
    "    }\n" +
    "\n" +
    "    #{{fluid.getElementFlowId('followingBallsG_2')}} {\n" +
    "        -moz-animation-delay:0.22s;\n" +
    "        -webkit-animation-delay:0.22s;\n" +
    "        -ms-animation-delay:0.22s;\n" +
    "        -o-animation-delay:0.22s;\n" +
    "        animation-delay:0.22s;\n" +
    "    }\n" +
    "\n" +
    "    #{{fluid.getElementFlowId('followingBallsG_3')}} {\n" +
    "        -moz-animation-delay:0.44s;\n" +
    "        -webkit-animation-delay:0.44s;\n" +
    "        -ms-animation-delay:0.44s;\n" +
    "        -o-animation-delay:0.44s;\n" +
    "        animation-delay:0.44s;\n" +
    "    }\n" +
    "\n" +
    "    #{{fluid.getElementFlowId('followingBallsG_4')}} {\n" +
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
    "<div id=\"{{fluid.getElementFlowId('followingBallsG')}}\">\n" +
    "    <span id=\"{{fluid.getElementFlowId('followingBallsG_1')}}\" class=\"followingBallsG\">\n" +
    "    </span>\n" +
    "    <span id=\"{{fluid.getElementFlowId('followingBallsG_2')}}\" class=\"followingBallsG\">\n" +
    "    </span>\n" +
    "    <span id=\"{{fluid.getElementFlowId('followingBallsG_3')}}\" class=\"followingBallsG\">\n" +
    "    </span>\n" +
    "    <span id=\"{{fluid.getElementFlowId('followingBallsG_4')}}\" class=\"followingBallsG\">\n" +
    "    </span>\n" +
    "</div>\n" +
    "</div>");
}]);

angular.module("templates/fluid/fluidOption.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidOption.html",
    "<div id=\"{{fluid.getElementFlowId('fluid_option')}}\" class=\"fluid-option {{task.locked?'locked':''}}\">\n" +
    "    <div id=\"{{fluid.getElementFlowId('fluid_option_template')}}\" class=\"fluid-option-template\"></div>\n" +
    "    <!-- <div class=\"fluid-option-bottom hidden\">\n" +
    "         <span class=\"pull-right\"><a href=\"#\" ng-click=\"close()\"><i class=\"text-danger fa fa-close\"></i></a></span>\n" +
    "     </div>-->\n" +
    "</div>");
}]);

angular.module("templates/fluid/fluidPanel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidPanel.html",
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
    "        <div class=\"panel-title\"><a ng-if=\"!fluidFrameService.fullScreen \" data-toggle='collapse'\n" +
    "                                    data-target='#_{{task.id}}'\n" +
    "                                    href='#'\n" +
    "                                    class=\"fluid-panel-heading-title\">\n" +
    "\n" +
    "\n" +
    "            <fluid-task-icon class=\"fluid-icon-left hidden-sm hidden-md hidden-xs\" task=\"task\"></fluid-task-icon>\n" +
    "            <span ng-if=\"task.loaded\" class=\"hidden25\">&nbsp;{{task.title}} - {{task.page.title}}</span></a>\n" +
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
    "        <div id='_id_fpb_{{task.id}}'\n" +
    "             class=\"panel-body fluid-panel container-fluid\"\n" +
    "             ng-disabled='!task.loaded'>\n" +
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
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("templates/fluid/fluidTaskIcon.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidTaskIcon.html",
    "<span><span ng-if=\"task.useImg\"><img class=\"fluid-task-icon\" width=\"{{width? width:15}}\" height=\"{{height?height:15}}\"\n" +
    "                                     ng-src=\"{{task.imgSrc}}\"></span><i\n" +
    "        ng-if=\"!task.useImg\"\n" +
    "        ng-class=\"task.glyph\"></i></span>");
}]);

angular.module("templates/fluid/fluidToolbar.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/fluid/fluidToolbar.html",
    "<div class='container-fluid animated fadeIn anim-dur' style=\"padding: 0\">\n" +
    "    <div class=\"ndg-breadcrumb\">\n" +
    "        <ul class='breadcrumb hidden-xs hidden-sm hidden25 hidden50 hidden-fullscreen-xs hidden-fullscreen-sm'>\n" +
    "\n" +
    "            <li class=\"pull-left\"\n" +
    "                ng-repeat='page in task.navPages'>\n" +
    "                <a ng-class=\"task.page.name == page.name ? 'plain-text':''\" title='{{page.title}}' href='#'\n" +
    "                   ng-click='goToEvent(page.name,page.param)'>{{page.title}}</a>\n" +
    "            </li>\n" +
    "\n" +
    "\n" +
    "            <div class='form-group pull-right'>\n" +
    "                <div class='btn-group {{group-size}}'>\n" +
    "                    <button ng-if=\"control.visible() == undefined || control.visible()\"\n" +
    "                            id='btn_tool_{{control.id}}_{{task.id}}' ng-repeat='control in controls'\n" +
    "                            title='{{control.label}}'\n" +
    "                            class='btn button-tool' ng-class='getClass(control.uiType)'\n" +
    "                            ng-click='runEvent(control,$event)'\n" +
    "                            ng-disabled='control.disabled' type='button'><span ng-class='control.glyph'></span></button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"clearfix\"></div>\n" +
    "        </ul>\n" +
    "        <ul class='breadcrumb hidden-md hidden100 hidden75 hidden-fullscreen-lg hidden-fullscreen-md'>\n" +
    "\n" +
    "            <li class=\"pull-left\">\n" +
    "                <a ng-class=\"task.page.name == task.navPages[0].name ? 'plain-text':''\"\n" +
    "                   title='{{task.navPages[0].title}}' href='#'\n" +
    "                   ng-click='goToEvent(task.navPages[0].name,task.navPages[0].param)'>{{task.navPages[0].title}}</a>\n" +
    "                <a ng-if=\"task.navPages.length > 1\" href=\"#\" title=\"more\"\n" +
    "                   ng-click=\"fluid.openOption(fluid.getElementFlowId('breadcrumb'),$event)\">...</a>\n" +
    "            </li>\n" +
    "\n" +
    "            <div class='form-group pull-right'>\n" +
    "                <div class='btn-group {{group-size}}'>\n" +
    "                    <button ng-if=\"control.visible() == undefined || control.visible()\"\n" +
    "                            id='btn_tool_{{control.id}}_{{task.id}}' ng-repeat='control in controls'\n" +
    "                            title='{{control.label}}'\n" +
    "                            class='btn button-tool' ng-class='getClass(control.uiType)'\n" +
    "                            ng-click='runEvent(control,$event)'\n" +
    "                            ng-disabled='control.disabled' type='button'><span ng-class='control.glyph'></span></button>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"clearfix\"></div>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <script type=\"text/ng-template\" id=\"{{fluid.getElementFlowId('breadcrumb')}}\">\n" +
    "        <ul class=\"breadcrumb\">\n" +
    "            <li class=\"pull-left\" ng-if=\"$index > 0\"\n" +
    "                ng-repeat='page in task.navPages'>\n" +
    "                <a ng-class=\"task.page.name == page.name ? 'plain-text':''\" title='{{page.title}}' href='#'\n" +
    "                   ng-click='goToEvent(page.name,page.param)'>{{page.title}}</a>\n" +
    "            </li>\n" +
    "\n" +
    "        </ul>\n" +
    "    </script>\n" +
    "</div>");
}]);
