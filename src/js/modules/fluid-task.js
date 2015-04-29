/**
 * Created by Jerico on 4/29/2015.
 */
//TODO: create state manager for task; task should not be altered with scope.
angular.module("fluidTask", ["oc.lazyLoad", "fluidSession"])
    .service("fluidTaskService", [function () {
        this.pathRegexPattern = /{[\w|\d]*}/;
        this.toolbars = [
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
        this.generateUrl = function (url, param) {
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
    }])
    .service("fluidStateService", ["$http", "sessionService", function (h, ss) {
        return {
            getTask: function (url) {
                console.log("fluidTask-fluidStateService-getTask.url:" + url);
                if (ss.containsKey(url)) {
                    return ss.getSessionProperty(url);
                } else {
                    h.get(url).success(function (task) {
                        ss.addSessionProperty(url, task);
                        console.log("fluidTask-fluidStateService-getTask.success:" + task);
                    }).error(function (msg) {
                        console.log("fluidTask-fluidStateService-getTask.error:" + msg);
                        return;
                    });
                }
            }
        }
    }]);


