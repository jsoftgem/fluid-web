/**Fluid Web v0.0.1
 * Created by Jerico de Guzman
 * October 2014**/
var fluidComponents = angular.module("fluid", ["angularFileUpload", "oc.lazyLoad", "LocalStorageModule", "templates-dist", "ngSanitize"]);

fluidComponents.config(["$httpProvider", "localStorageServiceProvider", function (h, ls) {
    ls.setPrefix("fluid")
        .setStorageType("sessionStorage")
        .setNotify(true, true);

    h.interceptors.push("fluidInjector");
}]);
fluidComponents.run([function () {
}]);
fluidComponents
    .directive("fluidPanel", ["fluidFrameService", "fluidHttpService", "$templateCache", "$compile",
        "fluidMessageService", "$rootScope", "$q", "$timeout", "$ocLazyLoad", "sessionService", "fluidOptionService",
        function (f, f2, tc, c, ms, rs, q, t, oc, ss, fos) {
            return {
                scope: {task: '='},
                restrict: "E",
                template: tc.get("templates/fluid/fluidPanel.html"),
                replace: true,
                link: {
                    pre: function (scope, element) {
                        /* Initialize variables*/
                        scope.pathRegexPattern = /{[\w|\d]*}/;

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
                        scope.toolbars = [
                            {
                                "id": 'showPageList',
                                "glyph": "fa fa-bars",
                                "label": "Menu",
                                "disabled": false,
                                "uiType": "success",
                                "action": function ($event) {
                                    if (!f.fullScreen && (rs.viewport === 'sm' || rs.viewport === 'xs' || (rs.viewport === 'lg' && (scope.task.size === 50 || scope.task.size === 25)))) {
                                        var source = $event.target;
                                        fos.open = !fos.open;
                                        scope.task.showPageList = false;

                                    } else {
                                        scope.task.showPageList = !scope.task.showPageList;
                                    }

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
                                    scope.baseTask = ss.getSessionProperty(scope.task.url);

                                    if (scope.baseTask) {
                                        console.info("fluid-panel-base-task-cache", scope.baseTask);
                                        var newTask = scope.task.newTask;
                                        var $task = {};
                                        scope.copy = {};
                                        angular.copy(scope.task, scope.copy);
                                        console.info("fluid-panel-cache-task", scope.baseTask);
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
                            }

                        });

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
                                console.info("post-task-watcher", task);
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
                                        parent.removeClass("col-lg-8");
                                        parent.removeClass("col-lg-6");
                                        parent.addClass("col-lg-4");
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
                                        parent.removeClass("col-lg-8");
                                        parent.removeClass("col-lg-4");
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
                                        parent.removeClass("col-lg-4");
                                        parent.addClass("col-lg-8");
                                        fos.closeOption();
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
                                        parent.removeClass("col-lg-8");
                                        parent.removeClass("col-lg-6");
                                        parent.removeClass("col-lg-4");
                                        parent.addClass("col-lg-12");
                                        fos.closeOption();
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
                                        fos.closeOption();
                                    };
                                    scope.task.fluidScreen = function () {
                                        f.toggleFluidscreen();
                                        if (!rs.$$phase) {
                                            scope.$apply();
                                        }
                                        task.showPageList = false;
                                        fos.closeOption();
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


                                if (scope.fluidFrameService.fullScreen) {
                                    parent.addClass("col-lg-12");
                                    parent.removeClass("col-lg-8");
                                    parent.removeClass("col-lg-4");
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

                        $(window).on("resize", function () {
                            if (scope.fluidFrameService.fullScreen) {
                                scope.fluidFrameService.getFrame().css("overflow", "hidden");
                                autoSizePanel(scope.task);

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
        }])
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
                        var frameHeight = height - 22;
                        if (scope.fluidFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + frameHeight + "px;overflow:auto");
                        } else {
                            element.attr("style", "height:" + frameHeight + "px;overflow:auto");
                        }
                        $("body").attr("style", "height: " + height + "px;overflow:hidden");
                    } else {
                        var height = window.innerHeight;
                        height = estimatedFrameHeight(height);
                        var frameHeight = height - 22;
                        if (scope.fluidFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                        } else {
                            element.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                        }
                        $("body").attr("style", "height: " + height + "px;overflow:hidden");
                    }
                });


                scope.show = function (task) {
                    if (!task.pinned) {
                        task.active = !task.active;
                    }
                };

                $(window).on("resize", function () {
                    if (!scope.fluidFrameService.fullScreen) {
                        var height = window.innerHeight;
                        height = estimatedFrameHeight(height);
                        var frameHeight = height - 22;
                        if (scope.fluidFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + frameHeight + "px;overflow:auto");
                        } else {
                            element.attr("style", "height:" + frameHeight + "px;overflow:auto");
                        }
                    } else {
                        var height = window.innerHeight;
                        height = estimatedFrameHeight(height) - 22;
                        if (scope.fluidFrameService.isSearch) {
                            frameDiv.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                        } else {
                            element.attr("style", "height:" + frameHeight + "px;overflow:hidden");
                        }
                    }

                    $("body").attr("style", "height: " + height + "px;overflow:hidden");
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
                    console.info("control", control);
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
    .directive("fluidBar", ["fluidFrameService", "$templateCache", "$compile", "fluidHttpService", "$templateCache", function (f, tc, c, f2, tc) {

        return {
            restrict: "AEC",
            link: function (scope, element) {

                scope.taskList = f.taskList;

                scope.open = function (task) {
                    if (task.active === true) {
                        scope.scroll(task);
                    } else {
                        task.active = true;
                        if (task.id.indexOf("gen") === -1) {
                            scope.userTask = {};
                            scope.userTask.fluidTaskId = task.id.split("_")[0];
                            scope.userTask.active = task.active;
                            scope.userTask.fluidId = task.fluidId;
                            f2.post("services/fluid_user_task_crud/save_task_state?field=active", scope.userTask, task);
                        }
                    }

                };
                scope.scroll = function (task) {
                    $("body").scrollTo($("#_id_fp_" + task.id), 800);

                }
            },
            replace: true,
            template: tc.get("templates/fluid/fluidBar2.html")
        };
    }])
    .directive("fluidField", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                type: "@",
                required: "=",
                disabled: "=",
                blur: "&"
            },
            template: tc.get("templates/fluid/fluidField.html"),
            replace: true,
            link: function (scope, elem, attr) {

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
                if (scope.type === undefined) {
                    scope.type = "text";
                }
            }
        }
    }])
    .directive("fluidTextArea", ["$templateCache", function (tc) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                required: "=",
                disabled: "=",
                rows: "=",
                cols: "="
            },
            template: tc.get("templates/fluid/fluidTextArea.html"),
            replace: true,
            link: function (scope, elem, attr) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
            }
        }
    }])
    .directive("fluidCheck", ["$compile", "$templateCache", function (c, tc) {
        return {
            restrict: "AE",
            scope: {model: "=", label: "@", required: "=", disabled: "=", name: "@"},
            template: tc.get("templates/fluid/fluidCheckbox.html"),
            link: function (scope, element) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
                if (scope.required === undefined) {
                    scope.required = false;
                }

                if (scope.disabled === undefined) {
                    scope.disabled = false;
                }

                if (scope.model === undefined) {
                    scope.model = false;
                }

                scope.update = function () {
                    if (scope.disabled === undefined || scope.disabled === false || scope.disabled === null) {
                        scope.model = !scope.model;
                    }
                }

            },
            replace: true
        }
    }])
    .directive("fluidMessage", [function () {
        return {
            restrict: "AE",
            replace: true,
            template: "<div></div>"

        }
    }])
    .directive("fluidModal", ["fluidFrameService", function (f) {
        return {
            restrict: "AE",
            template: "<div ng-class='fluidFrameService.fullScreen ? \"overlay-full\" : \"overlay\"' class='hidden animated fadeIn anim-dur'><div ng-style='style' class='fluid-modal animated pulse anim-dur'><div ng-transclude></div></div></div>",
            replace: true,
            transclude: true,
            link: function (scope, element, attr) {
                scope.fluidFrameService = f;
                scope.style = {};

                if (attr.height) {
                    scope.style.height = attr.height;
                }

                if (attr.width) {
                    scope.style.width = attr.width;
                }
            }
        }
    }])
    .directive("fluidSubTable", ["$compile", "fluidModalService", "fluidHttpService", "fluidFrameService", "$rootScope", function (c, fm, f, f2, rs) {
        return {
            restrict: "AE",
            transclude: true,
            replace: true,
            scope: {
                task: "=",
                fluid: "=",
                lookUp: "@",
                targetList: "=",
                targetUrl: "@",
                id: "@",
                title: "@",
                keyVar: "@",
                idField: "@",
                sourceUrl: "@",
                editUrl: "@",
                editEvent: "@",
                createEvent: "@"


            },
            template: "<div class='form-group'><div class='panel panel-primary'><div class='panel-heading'><a href='#' class='fluid-panel-heading-title' data-toggle='collapse' data-target='#{{id}}_collapse'>{{title}}</a><div class='pull-right'><div class='btn-group btn-group-xs'><button type='button' class='btn btn-info fluid-sub-table-control' ng-click='create()' ng-show='createEnabled'><span class='fa fa-plus'></span></button><button ng-show=\"lookUp == 'true'\" type='button' class='btn btn-info fluid-sub-table-control' ng-click='look()'><span class='fa fa-search'></span></button></div></div></div><div class='panel-collapse collapse in' id='{{id}}_collapse'><div class='panel-body' ><div ng-transclude></div><div class='container-fluid' style='overflow-y: auto'><table class='table table-responsive table-hover'></table></div></div></div></div>",
            link: function (scope, element) {
                if (!scope.lookUp) {
                    scope.lookUp = "true";
                }

                if (scope.createEvent) {
                    scope.createEnabled = true;
                } else {
                    scope.createEnabled = false;
                }
                if (scope.editEvent || scope.editUrl) {
                    scope.editEnabled = true;
                } else {
                    scope.editEnabled = false;
                }


                if (scope.id === undefined) {

                    var parent = $(element[0]).parent();

                    var size = $(parent).find("fluid-sub-table").length;

                    scope.id = "sb_tbl_" + size + "_" + scope.task.id;
                }
                if (!scope.targetList) {
                    scope.targetList = [];
                }
                var parent = $(element[0]).parent().get();

                var modal = $("<div>").attr("id", "{{id}}_add_tbl_mdl").addClass("overlay hidden animated fadeIn anim-dur").appendTo(parent).get();

                var modalContent = $("<div>").addClass("fluid-modal animated anim-dur").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

                var modalPanel = $("<div>").addClass("panel panel-primary").appendTo(modalContent).get();

                var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

                var spanTitle = $("<span>").addClass("text-inverse").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select " + scope.title).appendTo(modalPanelHeading).get();

                var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

                var inputSearch = $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

                var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

                $("<i>").addClass("fa fa-search").appendTo(inputSpan);

                var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

                var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

                var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

                var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

                var closeButton = $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

                var columns = element.find("fluid-sub-column");

                var table = element.find("table");

                var thead = $("<thead>").appendTo(table).get();

                var theadRow = $("<tr>").appendTo(thead).get();

                var tbody = $("<tbody>").appendTo(table).get();

                var modalTable = $("<table>").addClass("table table-responsive table-hovered table-bordered").appendTo(modalPanelBody).get();

                var mThead = $("<thead>").appendTo(modalTable).get();

                var mTheadRow = $("<tr>").appendTo(mThead).get();

                var mTbody = $("<tbody>").appendTo(modalTable).get();

                var tr = $("<tr>").addClass("animated").addClass("slideInDown").addClass("anim-dur").attr("ng-repeat", scope.keyVar + " in targetList").appendTo(tbody).get();

                var mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "addToList(" + scope.keyVar + ")").appendTo(mTbody).get();

                if (scope.targetUrl !== undefined) {
                    f.get(scope.targetUrl, scope.task).success(function (data) {
                        scope.targetList = data;
                    });
                }

                $("<th>").html("Action").appendTo(theadRow);

                var tdAction = $("<td>").appendTo(tr).get();

                var buttonGroupDiv = $("<div>").addClass("btn-group").addClass("btn-group-xs").appendTo(tdAction).get();

                if (scope.editEnabled) {
                    var editButton = $("<button>").addClass("btn btn-info").addClass("glyphicon glyphicon-edit").addClass("horizontalSpace").attr("type", "button").attr("title", "edit").attr("ng-click", "edit(" + scope.keyVar + "." + scope.idField + ",$index)").appendTo(buttonGroupDiv).get();
                }

                var removeButton = $("<button>").addClass("btn btn-danger").addClass("glyphicon glyphicon-minus").addClass("horizontalSpace").attr("type", "button").attr("title", "remove").attr("ng-click", "remove($index)").appendTo(buttonGroupDiv).get();


                for (var i = 0; i < columns.length; i++) {
                    var col = $(columns[i]);
                    $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(theadRow);
                    $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(mTheadRow);
                    if (col.attr("render-with") !== undefined) {
                        $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(tr);
                        $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(mTr);
                    } else {
                        $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(tr);
                        $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(mTr);
                    }


                }

                scope.create = function () {
                    rs.$broadcast(scope.createEvent + "_fp_" + scope.task.id);
                };

                scope.edit = function (param, index) {
                    if (scope.editUrl) {
                        f2.addTask(scope.editUrl + param, scope.task, true);
                    } else if (scope.editEvent) {
                        rs.$broadcast(scope.editEvent + "_fp_" + scope.task.id, param, index);
                    }


                };


                scope.look = function () {
                    if (scope.sourceUrl) {
                        f.get(scope.sourceUrl, scope.task).success(function (data) {
                            scope.sourceList = data;
                        });
                    }
                    fm.show(scope.id + "_add_tbl_mdl");
                    $(modalContent).addClass("pulse");
                    $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                        $(modalContent).removeClass("pulse");
                    });
                };


                scope.remove = function (index) {
                    scope.targetList.splice(index, 1);
                };

                scope.addToList = function (item) {
                    if (scope.targetList !== undefined) {
                        var exists = false;
                        for (var i = 0; i < scope.targetList.length; i++) {
                            var it = scope.targetList[i];
                            if (item.id === it.id) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            scope.targetList.push(item);
                            scope.close();
                        } else {
                            $(modalContent).addClass("shake");
                            $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                                $(modalContent).removeClass("shake");
                            });
                        }
                    } else {
                        $(modalContent).addClass("shake");
                        $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                            $(modalContent).removeClass("shake");
                        });
                    }

                };

                scope.close = function () {
                    fm.hide(scope.id + "_add_tbl_mdl", scope.id);
                };

                $(element.find("div[ng-transclude]")).remove();

                c(table)(scope);
                c(modal)(scope);

            }
        }
    }])
    .directive("fluidSubColumn", [function () {
        return {
            restrict: "AE",
            scope: {title: "@", model: "=", columnClass: "@", renderWith: "@"}

        }
    }])
    .directive("fluidLookUp", ["$compile", "fluidModalService", "fluidHttpService", "fluidFrameService", "$timeout", "$templateCache", function (c, fm, f, f2, t, tc) {
        return {
            restrict: "AE",
            scope: {
                task: "=",
                model: "=",
                sourceUrl: "@",
                label: "@",
                fieldLabel: "@",
                disabled: "=",
                required: "=",
                id: "@",
                keyVar: "@",
                fieldValue: "@",
                parentId: "@",
                name: "@"
            },
            link: function (scope, element) {

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
                /*TODO: must return the object when model is a field value */
                if (scope.id === undefined) {
                    var currentElement = $(element).get();
                    var index = $(currentElement).index();
                    scope.id = "lookUp_modal_" + index + "_" + scope.task.id;

                }
                t(function () {
                    scope.sourceList = [];
                    var parent = $(element[0]).parent().get();
                    if (scope.parentId) {

                        while ($(parent).attr("id") !== scope.parentId) {
                            parent = $(parent).parent().get();
                            if (parent === undefined)break;
                        }

                    }

                    var modal = $("<div>").attr("id", "{{id}}_add_tbl_mdl").addClass("overlay hidden animated fadeIn anim-dur").appendTo(parent).get();

                    var modalContent = $("<div>").addClass("fluid-modal animated anim-dur").attr("id", "{{id}}_mdl_cnt").appendTo(modal).get();

                    var modalPanel = $("<div>").addClass("panel panel-primary").appendTo(modalContent).get();

                    var modalPanelHeading = $("<div>").addClass("panel-heading").appendTo(modalPanel).get();

                    var spanTitle = $("<span>").addClass("text-inverse").addClass("col-lg-5 col-md-5 col-sm-3 col-xs-3").html("Select " + scope.label).appendTo(modalPanelHeading).get();

                    var inputGroup = $("<div>").addClass("col-lg-7 col-md-7 col-sm-9 col-xs-9").addClass("input-group").appendTo(modalPanelHeading).get();

                    var inputSearch = $("<input>").addClass("form-control").attr("type", "text").attr("ng-model", "search").appendTo(inputGroup).get();

                    var inputSpan = $("<span>").addClass("input-group-addon").appendTo(inputGroup).get();

                    $("<i>").addClass("fa fa-search").appendTo(inputSpan);

                    var modalPanelBody = $("<div>").addClass("panel-body").attr("style", "overflow:auto;height:200px").appendTo(modalPanel).get();

                    var modalPanelFooter = $("<div>").addClass("panel-footer").attr("style", "height:50px").appendTo(modalPanel).get();

                    var pullRightFooterDiv = $("<div>").addClass("pull-right").appendTo(modalPanelFooter).get();

                    var buttonGroup = $("<div>").addClass("btn-group btn-group-sm").appendTo(pullRightFooterDiv).get();

                    var closeButton = $("<button>").addClass("btn btn-info").attr("ng-click", "close()").attr("type", "button").html("close").appendTo(buttonGroup).get();

                    var columns = element.find("fluid-sub-column");

                    var modalTable = $("<table>").addClass("table table-responsive table-hover").appendTo(modalPanelBody).get();

                    var mThead = $("<thead>").appendTo(modalTable).get();

                    var mTheadRow = $("<tr>").appendTo(mThead).get();

                    var mTbody = $("<tbody>").appendTo(modalTable).get();
                    var mTr = null;
                    if (!scope.fieldValue) {
                        if (scope.fieldLabel) {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "," + scope.keyVar + "." + scope.fieldLabel + ")").appendTo(mTbody).get();
                        } else {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + ")").appendTo(mTbody).get();
                        }
                    } else {
                        if (scope.fieldLabel) {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "." + scope.fieldValue + "," + scope.keyVar + "." + scope.fieldLabel + ")").appendTo(mTbody).get();
                        } else {
                            mTr = $("<tr>").attr("ng-repeat", scope.keyVar + " in sourceList | filter:search").attr("ng-click", "select(" + scope.keyVar + "." + scope.fieldValue + ")").appendTo(mTbody).get();
                        }

                    }

                    for (var i = 0; i < columns.length; i++) {
                        var col = $(columns[i]);
                        $("<th>").addClass(col.attr("column-class")).html(col.attr("title")).appendTo(mTheadRow);

                        if (col.attr("render-with") !== undefined) {
                            $("<td>").addClass(col.attr("column-class")).html(col.attr("render-with")).appendTo(mTr);
                        } else {
                            $("<td>").addClass(col.attr("column-class")).html("{{" + col.attr("model") + "}}").appendTo(mTr);
                        }
                    }
                    var ctnr = undefined;


                    if (scope.fieldLabel) {
                        ctnr = element.find("input").attr("ng-model", "model." + scope.fieldLabel);
                    } else {
                        ctnr = element.find("input").attr("ng-model", "model");
                    }

                    $(element.find("div[ng-transclude]")).remove();
                    c(ctnr)(scope);
                    c(modal)(scope);


                    scope.look = function () {
                        if (scope.sourceUrl) {
                            f.get(scope.sourceUrl, scope.task).success(function (data) {
                                scope.sourceList = data;
                            });
                        }
                        fm.show(scope.id + "_add_tbl_mdl");
                        $(modalContent).addClass("pulse");
                        $(modalContent).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
                            $(modalContent).removeClass("pulse");
                        });
                    };

                });
                scope.close = function () {
                    fm.hide(scope.id + "_add_tbl_mdl", scope.id);
                };
                scope.select = function (item, label) {
                    scope.model = item;
                    scope.modelLabel = label;
                    scope.close();
                };
                scope.reset = function (event) {
                    var value = $(event.target).attr("value");
                    $(event.target).attr("value", value);
                };
                scope.isModeled = function () {
                    return scope.model !== undefined;
                };
                scope.isNotModeled = function () {
                    return scope.model === undefined;
                };
                scope.clear = function () {
                    scope.model = undefined;
                };

            },
            template: tc.get("templates/fluid/fluidLookup.html"),
            replace: true,
            transclude: true
        }
    }])
    .directive("fluidSelect", ["fluidHttpService", "$compile", "$timeout", "$templateCache", function (f, c, t, b, tc) {
        return {
            scope: {
                id: "@",
                task: "=",
                model: "=",
                label: "@",
                fieldGroup: "@",
                fieldValue: "@",
                fieldLabel: "@",
                sourceUrl: "@",
                disabled: "=",
                required: "=",
                change: "&",
                name: "@"
            },
            link: function (scope, element, attr) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }

                if (!scope.id) {
                    scope.id = "fl_slt_" + scope.task.id;
                }

                if (scope.required === undefined || scope.required === "undefined") {
                    scope.required = false;
                }

                if (scope.disabled === undefined || scope.disabled === "undefined") {
                    scope.disabled = false;
                }


                var options = "";

                if (scope.fieldValue === undefined) {
                    options = "item";
                } else {
                    options = "item." + scope.fieldValue;
                }

                if (scope.fieldLabel === undefined) {
                } else {
                    options += " as item." + scope.fieldLabel;
                }

                if (scope.fieldGroup) {
                    options += " group by item." + scope.fieldGroup;
                }

                options += " for item in sourceList";

                var select = element.find("select").attr("ng-options", options).attr("ng-model", "model").get();

                scope.$watch(function (scope) {
                    return scope.sourceUrl;
                }, function (value, old) {
                    console.info("fluid-select.sourceUrl", value);
                    if (value) {
                        f.get(scope.sourceUrl, scope.task).success(function (sourceList) {
                            scope.sourceList = sourceList;
                        });
                    }
                });

                scope.$watch(function (scope) {
                    return attr.values;
                }, function (value, old) {
                    console.info("fluid-select.values", value);
                    if (value) {
                        scope.sourceList = value.split(",");
                    }
                })

                // for IE ng-disabled issue
                scope.$watch(function (scope) {
                        return scope.disabled;
                    },
                    function (newValue) {
                        if (newValue === false) {
                            element.removeAttr("disabled");
                        }
                    });

                scope.$watch(function (scope) {
                    return scope.model;
                }, function (newValue) {
                    scope.change({item: newValue});
                });


                c(element.contents())(scope);
            },
            template: tc.get("templates/fluid/fluidSelect.html"),
            replace: true
        }
    }])
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
    .directive("fluidTooltip", [function () {
        return {
            restrict: "A",
            link: function (scope, element, attr) {

                scope.tooltipTime = 400;

                if (attr.tooltipTime) {
                    scope.tooltipTime = attr.tooltipTime;
                }

                if (attr.tooltipHeaderTitle) {
                    scope.tooltipHeaderTitle = attr.tooltipHeaderTitle;
                }

                if (attr.tooltipPosition) {
                    scope.tooltipPosition = attr.tooltipPosition;
                }

                if (attr.tooltipEvent) {
                    scope.tooltipEvent = attr.tooltipEvent;
                }

                if (attr.tooltipTitle) {
                    scope.tooltipTitle = attr.tooltipTitle;
                }


                if (attr.tooltipMy) {
                    scope.my = attr.tooltipMy;
                }

                if (attr.tooltipAt) {
                    scope.at = attr.tooltipAt;
                }


                if (!scope.tooltipPosition) {
                    scope.tooltipPosition = "{\"my\":\"top center\",\"at\":\"bottom center\"}";
                }


                if (!scope.tooltipEvent) {
                    scope.tooltipEvent = "hover";
                }

                scope.position = JSON.parse(scope.tooltipPosition);

                if (scope.my) {
                    scope.position.my = scope.my;
                }

                if (scope.at) {
                    scope.position.at = scope.at;
                }

                scope.tooltip = $(element[0]).qtip({
                        content: {
                            title: scope.tooltipHeaderTitle,
                            text: scope.tooltipTitle
                        },
                        position: {
                            at: scope.position.at,
                            my: scope.position.my,
                            adjust: {
                                method: "none shift"
                            }
                        }, hide: {
                            event: 'click',
                            inactive: scope.tooltipTime
                        },
                        style: "qtip-dark"
                    }
                );

                scope.api = scope.tooltip.qtip("api");

                scope.$watch(function () {
                    return $(element[0]).attr("tooltip-title")
                }, function (newValue) {
                    scope.api.set(
                        "content.text", newValue
                    );
                });


            }

        }
    }])
    .directive("fluidEdit", [function () {
        return {
            restrict: "AE",
            replace: true,
            transclude: true,
            template: "<div class='form-group'><label class='control-label col-sm-2'>{{label}}<span style='color: #ea520a' ng-show='required'>*</span></label><div class='col-sm-10 marginBottom5px' ng-transclude></div></div>",
            link: function (scope, element, attr) {
                if (attr.label) {
                    scope.label = attr.label;
                }

                if (attr.required) {
                    if (attr.required.toLowerCase() === "true") {
                        scope.required = true;
                    } else {
                        scope.required = false;
                    }
                }
            }
        }
    }])
    .directive("fluidImage", ["$timeout", "$upload", "sessionService", "fluidHttpService", "$templateCache", function (t, u, ss, fh, tc) {
        return {
            scope: {
                model: "=",
                label: "@",
                required: "=",
                url: "@",
                method: "@",
                task: "=",
                sourceUrl: "@",
                fileChanged: "&",
                defaultImage: "@",
                disabled: "="
            },
            template: tc.get("templates/fluid/fluidImage.html"),
            replace: true,
            link: function (scope) {
                scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
                scope.preview = [];
                scope.notDone = true;
                var tries = 0;

                if (!scope.defaultImage) {
                    scope.defaultImage = "../assets/gallery/default.png";
                }

                scope.refresh = function () {
                    t(function () {
                        console.info("model", scope.model);
                        if (scope.model) {
                            console.info("model-2", scope.model);
                            if (scope.sourceUrl) {
                                scope.preview[0] = {};
                                scope.preview[0].dataUrl = fh.host + scope.sourceUrl + scope.model;
                            }
                            if (tries == 5) {
                                tries = 0;
                                scope.notDone = false;
                            } else {
                                tries++;
                                scope.refresh();
                            }
                        } else {
                            if (!scope.model) {
                                scope.preview[0] = {};
                                scope.preview[0].dataUrl = scope.defaultImage;
                            }
                            if (tries == 5) {
                                tries = 0;
                                scope.notDone = false;
                            } else {
                                tries++;
                                scope.refresh();
                            }
                        }
                    }, 1000);
                };
                scope.refresh();


                scope.onFileSelect = function (file) {

                    if (file != null) {
                        if (scope.fileReaderSupported && file.type.indexOf('image') > -1) {
                            t(function () {
                                var fileReader = new FileReader();
                                fileReader.readAsDataURL(file);
                                fileReader.onload = function (e) {
                                    t(function () {
                                        file.dataUrl = e.target.result;
                                    });
                                };
                                var bufferRead = new FileReader();

                                bufferRead.readAsArrayBuffer(file);

                                bufferRead.onload = function (e) {
                                    t(function () {
                                        file.data = e.target.result;
                                        u.upload({
                                            url: fh.host + scope.url,
                                            method: scope.method,
                                            headers: {
                                                "fluid-container-id": "_id_fpb_" + scope.task.id,
                                                "Authorization": ss.getSessionProperty(AUTHORIZATION),
                                                "fluidPage": scope.task.currentPage,
                                                "fluidUploadFileId": scope.model
                                            },
                                            data: {file: file}
                                        }).progress(function (evt) {
                                            file.progress = parseInt(100.0 * evt.loaded / evt.total);
                                        }).success(function (data, status, headers, config) {
                                            $("#_id_fpb_" + scope.task.id).loadingOverlay("remove");
                                            scope.model = data.id;
                                            scope.fileChanged();

                                        }).error(function (data, status, headers, config) {
                                            $("#_id_fpb_" + scope.task.id).loadingOverlay("remove");
                                        });
                                    });

                                }
                            });
                        }
                    }
                };

            }
        }
    }])
    .directive("fluidLoader", ["fluidLoaderService", function (fls) {

        return {
            restrict: "AE",
            scope: {loaderClass: "@"},
            transclude: true,
            template: "<span><i class='text-inverse' ng-show='!fluidLoaderService.loaded' ng-class='loaderClass'></i><span ng-show='fluidLoaderService.loaded' ng-transclude></span></span>",
            replace: true,
            link: function (scope, element) {
                scope.fluidLoaderService = fls;
                scope.fluidLoaderService.loaded = true;
            }

        }

    }])
    .directive("fluidLoader", ["fluidLoaderService", function (fls) {

        return {
            restrict: "AE",
            scope: {idleClass: "@"},
            transclude: true,
            template: "<span><i class='text-inverse' ng-show='fluidLoaderService.loaded' ng-class='idleClass'></i><span ng-show='!fluidLoaderService.loaded' ng-transclude></span></span>",
            replace: true,
            link: function (scope, element) {
                scope.fluidLoaderService = fls;
                scope.fluidLoaderService.loaded = true;
            }

        }

    }])
    .directive("fluidDatePicker", ["$filter", "$templateCache", function (f, tc) {
        return {
            restrict: "AE",
            scope: {
                name: "@",
                model: "=",
                label: "@",
                format: "@",
                required: "=",
                disabled: "="
            },
            template: tc.get("templates/fluid/fluidDatePicker.html"),
            replace: true,
            link: function (scope, elem, attr) {

                if (scope.model) {
                    scope.temp = scope.model;
                }

                if (scope.format === undefined) {
                    scope.format = "mm/dd/yyyy";
                }

                var inDatepicker = $(elem[0]).find(".datepicker").datepicker({
                    format: scope.format,
                    forceParse: false,
                    language: "en"
                });

                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim();
                }

                scope.convertToTimestamp = function () {
                    var date = $(elem[0]).find(".datepicker").datepicker("getDate");
                    var convertedDate = new Date(date).getTime();
                    scope.model = convertedDate;
                }

            }

        }
    }])
    .directive("fluidRadio", ["$compile", "$templateCache", function (c, tc) {
        return {
            scope: {
                name: "@",
                model: "=",
                label: "@",
                required: "=",
                disabled: "=",
                direction: "@",
                group: "@",
                options: "="
            },
            restrict: "AE",
            replace: true,
            template: tc.get("templates/fluid/fluidRadio.html"),
            link: function (scope, element) {
                if (!scope.name && scope.label) {
                    scope.name = scope.label.trim().split(" ").join("_");
                }
                if (scope.group === undefined) {
                    scope.group = "optRadio";
                }
                if (scope.direction === undefined) {
                    scope.direction = "horizontal";
                }

                var parent = element[0];
                var parentDiv = $(element[0]).find(".fluid-radio").get();
                var div = undefined;

                for (var i = 0; i < scope.options.length; i++) {
                    var option = scope.options[i];

                    if (div) {
                        if (scope.direction === "vertical") {
                            div = $("<div>").addClass("radio").appendTo(parentDiv);
                        }
                    } else {
                        div = $("<div>").addClass("radio").appendTo(parentDiv);
                        if (scope.direction === "horizontal") {
                            $(div).addClass("fluid-radio-horizontal");
                        }
                    }


                    if (scope.disabled) {
                        option.disabled = scope.disabled;
                    }

                    if (scope.required) {
                        option.required = scope.required;
                    }

                    var label = $("<label>").html(option.label).appendTo(div).get();

                    var radio = $("<input>").attr("name", scope.group).attr("type", "radio").attr("ng-click", "select('" + option.value + "')").prependTo(label).get();


                    if (option.disabled) {
                        $(radio).attr("ng-disabled", option.disabled);
                    }

                    if (option.required) {
                        $(radio).attr("ng-required", option.required);
                    }

                    if (scope.model) {
                        if (option.value === scope.model) {
                            $(radio).prop("checked", true);
                        }
                    }

                }

                scope.select = function (value) {
                    scope.model = value;
                }

                c(element.contents())(scope);
            }
        }
    }])
    .directive("fluidUploader", ["$upload", "$templateCache", function (u, tc) {
        return {
            restict: "AE",
            link: function (scope, element, attr) {

            },
            template: tc.get("templates/fluid/fluidUploader.html")
        }
    }])
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
    }])
    .directive("fluidOption", ["$templateCache", "fluidOptionService", function (tc, fos) {
        return {
            restrict: "AE",
            scope: false,
            replace: true,
            transclude: true,
            template: tc.get("templates/fluid/fluidOption.html"),
            link: function (scope, element, attr) {
                scope.fluidOptionService = fos;
                if(attr.id){
                    scope.id = attr.id;
                }
                scope.$watch(function (scope) {
                    return element.parent().height();
                }, function (height) {
                    console.info("fluidOption-parent-task", scope.task);
                    console.info("fluidOption-parent-height", height);
                    scope.parentHeight = height;
                    element.css("max-height", height - 20);
                    element.css("width", element.parent().width());

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
    .service("fluidFrameService", ["fluidHttpService", "$timeout", function (f, t) {
        this.isSearch = false;
        this.searchTask = "";
        this.taskUrl = "services/fluid_task_service/getTask?name=";
        this.fullScreen = false;
        if (this.taskList === undefined) {
            this.taskList = [];
        }
        this.pushTask = function (task) {
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
                console.info("task", fullScreenTask);
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

    }])
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
        return this;
    }])
    .service("fluidControlService", [function () {

        this.controls = [];

        return this;
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
    }])
    .service("fluidModalService", [function () {
        var fluidModalService = {};

        fluidModalService.show = function (id) {
            $("#" + id).removeClass("hidden");
            $(".frame-content").scrollTo($("#" + id), 800);
        };

        fluidModalService.hide = function (id, sourceId) {
            $("#" + id).addClass("hidden");
            if (sourceId) {
                $(".frame-content").scrollTo($("#" + sourceId), 800);
            }
        };

        return fluidModalService;
    }])
    .service("fluidLoaderService", [function () {
        this.loaded = true;
        this.enabled = true;
        return this;
    }])
    .service("fluidNotificationService", [function () {

        this.fluidNotifications = [];

        return this;


    }])
    .service("sessionService", ["localStorageService", function (ls) {

        this.isSessionSupported = ls.isSupported;

        this.type = function () {
            return this.isSessionSupported ? "session storage" : "cookie storage";
        }

        this.isSessionOpened = function () {
            return ls.get(AUTHORIZATION) !== null;
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

    }])
    .service("fluidOptionService", [function () {
        this.templateUrl = undefined;
        this.open = false;

        this.openOption = function (templateUrl) {
            this.templateUrl = templateUrl;
            this.open = true;
        }

        this.closeOption = function () {
            this.open = false;
            this.templateUrl = undefined;
        }

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
                if (element.find("span.fluid-view-lg").css("display") === 'block') {
                    rs.viewport = "lg";
                } else if (element.find("span.fluid-view-md").css("display") === 'block') {
                    rs.viewport = "md";
                } else if (element.find("span.fluid-view-sm").css("display") === 'block') {
                    rs.viewport = "sm";
                } else if (element.find("span.fluid-view-xs").css("display") === 'block') {
                    rs.viewport = "xs";
                }
            });
        }
    }
}]);
/*TODO: improve*/
fluidComponents.directive("fluidVisible", ["$rootScope", "$window", function (rs, w) {

    return {
        restrict: "AC",
        scope: {task: "="},
        link: function (scope, element, attr) {
            var currentElement = element[0];
            console.info("fluidVisible-source", currentElement);

            scope.source = currentElement;

            if (attr.view) {
                scope.view = attr.view;
            }
            if (attr.size) {
                scope.size = attr.size;
            }

            scope.checkView = function () {
                if (scope.view) {
                    if (scope.view.indexOf(",") > -1) {
                        var views = scope.view.split(",");
                        console.info("fluidVisible-views", views);
                        var returnValue = {valid: false};
                        angular.forEach(views, function (data) {
                            if (rs.viewport === data) {
                                this.valid = true;
                            }
                        }, returnValue);
                        if (!returnValue.valid) {
                            $(scope.source).hide();
                        } else {
                            $(scope.source).show();
                        }
                    } else {
                        var valid = false;
                        if (rs.viewport === scope.view) {
                            valid = true;
                        }
                        if (!valid) {
                            $(scope.source).hide();
                        } else {
                            $(scope.source).show();
                        }
                    }
                }
            }
            scope.checkSize = function () {
                if (rs.viewport === "lg") {
                    if (scope.task) {
                        if (scope.size) {
                            if (scope.size.indexOf(",") > -1) {
                                var sizes = scope.size.split(",");
                                console.info("fluidVisible-sizes", sizes);
                                console.info("sizes", sizes);
                                var returnValue = {valid: false};
                                angular.forEach(sizes, function (data) {
                                    if (scope.task.size + '' === data) {
                                        this.valid = true;
                                    }
                                }, returnValue);
                                console.info("size-value", returnValue);
                                if (!returnValue.valid) {
                                    $(scope.source).hide();
                                } else {
                                    $(scope.source).show();
                                }
                            } else {
                                var valid = false;
                                if (scope.task.size + '' === scope.size) {
                                    valid = true;
                                }
                                if (!valid) {
                                    $(scope.source).hide();
                                } else {
                                    $(scope.source).show();
                                }
                            }


                        }
                    }
                }
            }

            scope.checkView();
            scope.checkSize();

            $(w).on("resize", function () {
                scope.checkView();
                scope.checkSize();
            })
            if (scope.task) {
                scope.$watch(function (scope) {
                    return scope.task.size
                }, function (value) {
                    scope.checkSize();
                });
            }

        }
    }

}])
fluidComponents
    .directive("hidden50", ["fluidFrameService", function (f) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                if (f.fullScreen && (!attr.showOnFullscreen || attr.showOnFullscreen === "false")) {
                    element.hide();
                } else if (f.fullScreen && attr.showOnFullscreen === "true") {
                    element.show();
                }
                else if (scope.task) {
                    scope.$watch(function (scope) {
                        return scope.task.size;
                    }, function (value) {
                        switch (value) {
                            case 25:
                                if (!element.attr("hidden25")) {
                                    element.show();
                                }
                                break;
                            case 50:
                                console.info("hidden50-hidden", element);
                                element.hide();
                                break;
                            case 75:
                                if (!element.attr("hidden75")) {
                                    element.show();
                                }
                                break;
                            case 100:
                                if (!element.attr("hidden100")) {
                                    element.show();
                                }
                                break;
                        }
                    });

                }

            }
        }
    }])
    .directive("hidden100", ["fluidFrameService", function (f) {
        return {
            restrict: "AC",
            scope: false,
            link: function (scope, element, attr) {
                if (f.fullScreen && (!attr.showOnFullscreen || attr.showOnFullscreen === "false")) {
                    element.hide();
                } else if (f.fullScreen && attr.showOnFullscreen === "true") {
                    element.show();
                }
                else if (scope.task) {
                    scope.$watch(function (scope) {
                        return scope.task.size;
                    }, function (value) {
                        switch (value) {
                            case 25:
                                if (!element.attr("hidden25")) {
                                    element.show();
                                }
                                break;
                            case 50:
                                if (!element.attr("hidden50")) {
                                    element.show();
                                }
                                break;
                            case 75:
                                if (!element.attr("hidden75")) {
                                    element.show();
                                }
                                break;
                            case 100:
                                element.hide();
                                break;
                        }
                    });

                }

            }
        }
    }]);

/**Prototypes**/
function Task() {
    var task = {};

    task.id = undefined;

    task.glyph = undefined;

    task.title = undefined;

    task.active = undefined;

    task.size = undefined;

    task.pinned = undefined;

    task.locked = undefined;

    this.url = undefined;

    return task;
}

function Control() {
    var control = {};
    control.id = undefined;
    control.glyph = undefined;
    control.label = undefined;
    control.disabled = undefined;
    return control;
}

var eventInterceptorId = "event_interceptor_id_";
var goToEventID = "event_got_id_";
var EVENT_NOT_ALLOWED = "not_allowed_";
var AUTHORIZATION = "authorization";

function estimateHeight(height) {
    var _pc = window.innerWidth < 450 ? 55 : window.innerWidth < 768 ? 55 : window.innerWidth < 1200 ? 73 : 50;
    /*var _pc = height >= 768 ? height * 0.055 : height <= 768 && height > 600 ? height * 0.065 : height <= 600 && height > 400 ? height * 0.09 : height * 0.15;*/
    return height - _pc
}

function estimatedFrameHeight(height) {
    var _pc = window.innerWidth < 450 ? 60 : window.innerWidth < 768 ? 60 : window.innerWidth < 1200 ? 80 : 50;
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
    var $index = -1;
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
    var height = window.innerHeight;
    height = estimateHeight(height) - 30;
    var panel = $("#_id_fp_" + task.id + ".panel");
    var panelBody = $("#_id_fp_" + task.id + ".panel div.fluid-panel-content");
    console.info("fluid-panel-fullscreen-height", height);
    panel.height(height);
    var headerHeight = /* panel.find("div.panel-heading").height()*/ 114;
    console.info("fluid-panel-fullscreen-header-height", headerHeight);
    var bodyHeight = height - headerHeight;
    console.info("fluid-panel-fullscreen-body-height", bodyHeight);
    panelBody.css("height", bodyHeight, "important");
    panelBody.css("overflow", "auto");


}