/**
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
    /*var _pc = height >= 768 ? height * 0.055 : height <= 768 && height > 600 ? height * 0.065 : height <= 600 && height > 400 ? height * 0.09 : height * 0.15;*/
    return height - _pc
}

function estimatedFrameHeight(height) {
    var _pc = window.innerWidth < 450 ? 60 : window.innerWidth < 768 ? 60 : window.innerWidth < 1200 ? 65 : 50;
    /*var _pc = height >= 768 ? height * 0.055 : height <= 768 && height > 600 ? height * 0.065 : height <= 600 && height > 400 ? height * 0.09 : height * 0.15;*/
    return height - _pc
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
    height = estimateHeight(height) - 30;

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

                // console.info(infoSig + ".sourceId", sourceId);

                // console.info(infoSig + ".element", element);

                if ($.contains(element, e.target)) {
                    // console.info(infoSig + ".contains", e.target);
                    return;
                }

                if (elementSourceEvent) {

                    var elementSource = $("[id='" + elementSourceEvent + "']");

                    var activeElementSource = elementSource.context.activeElement;

                    if (elementSource.find(e.target).length > 0) {
                        //console.info(infoSig + ".contains.elementSourceEvent", e.target);
                        return;
                    }

                    if (elementSource.is(e.target)) {
                        // console.info(infoSig + ".is.elementSourceEvent", e.target);
                        return;
                    }

                    if (elementSourceEvent !== sourceId) {
                        fluidOptionScope.close();
                    }
                }


            }
        });
    });

});