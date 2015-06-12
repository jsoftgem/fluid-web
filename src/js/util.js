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

