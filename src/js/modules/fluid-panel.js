/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPanel", ["oc.lazyLoad", "fluidHttp", "fluidFrame", "fluidMessage", "fluidOption", "fluidSession", "fluidTool", "fluidPage", "fluidTask", "fluidTaskcontrols"])
    .directive("fluidPanel", ["fluidFrameService", "fluidHttpService", "$templateCache", "$compile",
        "fluidMessageService", "$rootScope", "$q", "$timeout", "$ocLazyLoad",
        "sessionService", "fluidOptionService", "fluidPageService",
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
    .directive("fluidPanel2", ["$templateCache", "FluidPanelModel", "fluidToolbarService", "$ocLazyLoad",
        function (tc, FluidPanel, ftb, oc) {
            return {
                require: "^fluidFrame2",
                scope: {task: "="},
                restrict: "E",
                replace: true,
                template: tc.get("templates/fluid/fluidPanel2.html"),
                link: {
                    pre: function (scope, element, attr) {

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
                            });
                        } else {
                            scope.fluidPanel = new FluidPanel(scope.task);
                        }

                        scope.setSize = function (size) {
                            console.info("fluidPanel2-setSize.size", size);
                            switch (size) {
                                case 25:
                                    element.addClass("col-lg-3");
                                    element.removeClass("col-lg-6");
                                    element.removeClass("col-lg-9");
                                    element.removeClass("col-lg-12");
                                    break;
                                case 50:
                                    element.addClass("col-lg-6")
                                    element.removeClass("col-lg-3");
                                    element.removeClass("col-lg-9");
                                    element.removeClass("col-lg-12");
                                    break;
                                case 75:
                                    element.addClass("col-lg-9");
                                    element.removeClass("col-lg-3");
                                    element.removeClass("col-lg-6");
                                    element.removeClass("col-lg-12");
                                    break;
                                case 100:
                                    element.addClass("col-lg-12");
                                    element.removeClass("col-lg-3");
                                    element.removeClass("col-lg-6");
                                    element.removeClass("col-lg-9");
                                    break;
                                default:
                                    element.addClass("col-lg-12");
                                    element.removeClass("col-lg-3");
                                    element.removeClass("col-lg-6");
                                    element.removeClass("col-lg-9");
                            }
                        }

                        scope.$watch(function (scope) {
                            return scope.task.size;
                        }, function (newSize, oldSize) {
                            scope.setSize(newSize);
                        });

                    },
                    post: function (scope, element, attr) {

                        scope.getElementFlowId = function (id) {
                            return id + "_" + scope.task.id;
                        }

                        if(!scope.$$phase){
                            scope.$apply();
                        }

                    }
                }


            }

        }])
    .factory("FluidPanelModel", ["TaskControl", "ToolBarItem", "fluidPanelService", "fluidTaskService", function (TaskControl, ToolBarItem,
                                                                                                                  fluidPanelService, FluidTask) {
        var fluidPanel = function (task) {
            var taskModel = new FluidTask(task);
            task.page = taskModel.page;
            this.loaded = false;
            var closeControl = new TaskControl(task);
            closeControl.glyph = "fa fa-close";
            closeControl.uiClass = "btn btn-danger";
            closeControl.label = "Close";
            closeControl.action = function (task, $event) {

            }

            var minimizeControl = new TaskControl(task);
            minimizeControl.glyph = "fa fa-caret-down";
            minimizeControl.uiClass = "btn btn-info";
            minimizeControl.label = "Minimize";
            minimizeControl.action = function (task, $event) {
                task.active = false;
            }


            var refreshControl = new TaskControl(task);
            refreshControl.glyph = "fa fa-refresh";
            refreshControl.uiClass = "btn btn-info";
            refreshControl.label = "Refresh";
            refreshControl.action = function (task, $event) {

            }
            var size100ToolBarItem = new ToolBarItem(task);
            size100ToolBarItem.glyph = "";
            size100ToolBarItem.class = "hidden-xs hidden-sm hidden-md";
            size100ToolBarItem.showText = true;
            size100ToolBarItem.uiClass = "btn btn-info";
            size100ToolBarItem.label = "100%";
            size100ToolBarItem.action = function (task, $event) {
                task.size = 100;
            }

            var size75ToolBarItem = new ToolBarItem(task);
            size75ToolBarItem.glyph = "";
            size75ToolBarItem.class = "hidden-xs hidden-sm hidden-md";
            size75ToolBarItem.showText = true;
            size75ToolBarItem.uiClass = "btn btn-info";
            size75ToolBarItem.label = "75%";
            size75ToolBarItem.action = function (task, $event) {
                task.size = 75;
            }

            var size50ToolBarItem = new ToolBarItem(task);
            size50ToolBarItem.glyph = "";
            size50ToolBarItem.class = "hidden-xs hidden-sm hidden-md";
            size50ToolBarItem.showText = true;
            size50ToolBarItem.uiClass = "btn btn-info";
            size50ToolBarItem.label = "50%";
            size50ToolBarItem.action = function (task, $event) {
                task.size = 50;
            }

            var size25ToolBarItem = new ToolBarItem(task);
            size25ToolBarItem.glyph = "";
            size25ToolBarItem.class = "hidden-xs hidden-sm hidden-md";
            size25ToolBarItem.showText = true;
            size25ToolBarItem.uiClass = "btn btn-info";
            size25ToolBarItem.label = "25%";
            size25ToolBarItem.action = function (task, $event) {
                task.size = 25;
            }

            var nextToolBarItem = new ToolBarItem(task);
            nextToolBarItem.glyph = "fa fa-arrow-right";
            nextToolBarItem.uiClass = "btn btn-info";
            nextToolBarItem.label = "Next";
            nextToolBarItem.action = function (task, $event) {

            }

            var backToolBarItem = new ToolBarItem(task);
            backToolBarItem.glyph = "fa fa-arrow-left";
            backToolBarItem.uiClass = "btn btn-info";
            backToolBarItem.label = "Back";
            backToolBarItem.action = function (task, $event) {

            }
            var homeToolBarItem = new ToolBarItem(task);
            homeToolBarItem.glyph = "fa fa-home";
            homeToolBarItem.uiClass = "btn btn-info";
            homeToolBarItem.label = "Home";
            homeToolBarItem.action = function (task, $event) {

            }


        }
        return fluidPanel;
    }])
    .service("fluidPanelService", [function () {
        this.fluidPanel = [];
        this.clear = function (name) {

        }
        return this;
    }]);
