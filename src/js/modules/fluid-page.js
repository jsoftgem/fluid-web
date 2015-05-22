/**
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
                            console.info("fluidPage-loadPage.page", page);
                            scope.fluidPanel.loaded = false;

                            if (scope.fluidPanel.pages[scope.page.name] != null) {
                                scope.fluidPage = scope.fluidPanel.pages[scope.page.name];
                            } else {
                                scope.fluidPage = new FluidPage(page);
                                scope.fluidPanel.pages[scope.page.name] = scope.fluidPage;
                            }

                            if (scope.fluidPage.ajax) {
                                fps.loadAjax(scope.fluidPage)
                                    .then(function (data) {
                                        scope.data = data;
                                        element.html("<ng-include class='fluid-page' src='fluidPageService.render(fluidPage)' onload='onLoad()'></ng-include>");
                                        element.attr("page-name", scope.fluidPage.name);
                                        c(element.contents())(scope);
                                        console.info("fluidPage-loadPage.loaded-page", scope.fluidPage);
                                    });
                            } else {
                                element.html("<ng-include class='fluid-page' src='fluidPageService.render(fluidPage)' onload='onLoad()'></ng-include>");
                                element.attr("page-name", scope.fluidPage.name);
                                c(element.contents())(scope);
                                console.info("fluidPage-loadPage.loaded-page", scope.fluidPage);
                            }
                        }

                        console.info("fluidPage.fluidPanel", scope.fluidPanel);

                        scope.$watch(function (scope) {
                            return scope.page;
                        }, function (newPage, oldPage) {
                            scope.loadPage(newPage);
                        });


                    },
                    post: function (scope, element, attr) {



                        //TODO: page onLeave handling
                        scope.onLoad = function () {
                            console.info("fluidPage-page-onload.fluidId", scope.fluidPanel.id);
                            scope.fluidPage.fluidId = scope.fluidPanel.id;
                            scope.fluidPage.$ = element;
                            scope.fluidPage.$scope = scope;
                            scope.fluidPage.option = new FluidOption(scope.fluidPanel);
                            scope.fluidPage.loaded = false;
                            //TODO: page onLoad error handling
                            scope.fluidPage.onLoad();
                            scope.fluidPanel.loaded = true;
                            scope.fluidPage.loaded = true;
                        }

                    }
                },
                replace: true
            }
        }])
    .factory("FluidPage", ["fluidPageService", "$resource", "$q", "$timeout", "$rootScope", function (fps, r, q, t, rs) {
        var fluidPage = function (page) {
            console.info("FluidPage-FluidPage.page", page);
            if (fps.pages[page.name]) {
                return fps.pages[page.name];
            } else {
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
                this.name = page.name;
                this.id = page.id;
                this.title = page.title;
                this.static = page.static;
                this.html = page.html;
                this.home = page.home;
                this.ajax = page.ajax;

                this.close = function (ok, cancel, $event) {
                    var page = this;
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

                this.failed = function (reason) {
                    rs.$broadcast("page_close_failed_evt" + this.fluidId + "_pg_" + this.name, reason);
                }

                this.onLoad = function () {
                    return true;
                }

                this.onClose = function (ok, cancel) {
                    ok();
                }

                this.onChange = function (proceed, cancel, $event) {
                    proceed();
                }

                this.onDestroy = function () {
                }

                this.clear = function () {
                    this.onDestroy();
                    fps.pages[this.name] = this.default;
                }

                var def = {};
                angular.copy(this, def);
                this.default = def;
                fps.pages[page.name] = this;
                console.info("fluidPage-FluidPageg-newPage.page", this);
            }
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

