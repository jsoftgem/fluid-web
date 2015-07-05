/**
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
                    pre: function (scope, element, attr) {
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
                        }
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
                    post: function (scope, element, attr) {
                        //TODO: page onLeave handling


                        if (scope.fluidPanel) {

                            scope.fluidPanel.frame.progress.onComplete(scope.fluidPanel.getElementFlowId("toggleFullscreen"), function () {
                                console.debug("fluidPage.fluidPanel.frame.progress.onComplete-toggleFullscreen", scope.fluidPanel.currentPage());
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
                    console.debug("fluid-page-FluidPage-onRefresh.proceed", proceed);
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

