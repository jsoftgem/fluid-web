/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPage", ["fluidHttp", "fluidOption", "fluidPanel"])
    .directive("fluidPage", ["$templateCache", "fluidPageService", "FluidPage", "$compile", "FluidBreadcrumb", "FluidOption",
        function (tc, fps, FluidPage, c, FluidBreadcrumb, FluidOption) {
            return {
                restrict: "E",
                scope: {fluidPanel: "="},
                template: tc.get("templates/fluid/fluidPage.html"),
                link: {
                    pre: function (scope) {
                        scope.$on("$destroy", function () {
                            console.debug("fluid-page.$destroy", scope.fluidPage);
                            if (scope.fluidPage) {
                                scope.fluidPage.clear();
                            }
                        });
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

            if (page.ajax) {
                if (page.ajax.url) {
                    if (!page.ajax.actions) {
                        page.ajax.actions = [];
                    }
                    if (!page.ajax.param) {
                        page.ajax.param = {};
                    }

                    var url = "fid=" + page.fluidId + ";pg=" + page.name + ";" + page.ajax.url;

                    this.resource = r(url, page.ajax.param, page.ajax.actions);

                } else {
                    throw "Page ajax.url is required!";
                }
            }

            /*
             TODO: v 0.2.0 url page
             if(page.url){

             }else{

             }
             */
            console.debug("FluidPage-FluidPage.page", page);

            this.isHome = page.isHome;
            this.name = page.name;
            this.id = page.id;
            this.title = page.title;
            this.static = page.static;
            this.html = page.html;
            this.home = page.home;
            this.ajax = page.ajax;
            this.fluidId = page.fluidId;
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
                var page2 = this;
                var pageElement = page2.$();
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
                    if (page2.option) {
                        page2.option.isCancelled = false;
                        page2.option.close();
                    }
                    page2.onDestroy();
                    page2.clear();
                }, function () {
                    cancel();
                    if (page2.option) {
                        page2.option.isCancelled = true;
                        page2.option.close();
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
            };
            this.load = function (ok, failed) {
                this.onLoad(function () {
                    ok();
                }, failed);
            };
            this.failed = function (reason) {
                rs.$broadcast("page_close_failed_evt" + this.fluidId + "_pg_" + this.name, reason);
            };
            this.fullscreen = function (ok, cancel) {
                this.onFullscreen(function () {
                    ok();
                }, function () {
                    cancel();
                });
            };
            this.fluidscreen = function (ok, cancel) {
                this.onFluidscreen(function () {
                    ok();
                }, function () {
                    cancel();
                });
            };
            this.onLoad = function (ok, failed) {
                ok();
            };
            this.onClose = function (ok, cancel) {
                ok();
            };
            this.onChange = function (proceed, cancel, $event) {
                proceed();
            };
            this.onRefresh = function (proceed, cancel, $event) {
                proceed(this);
            };
            this.onDestroy = function () {
            };
            this.onViewportChange = function (viewport) {
            };
            this.onSizeChange = function (size) {

            };
            this.onFullscreen = function (ok, cancel) {
                ok();
            };
            this.onFluidscreen = function (ok, cancel) {
                ok();
            };
            this.clear = function () {
                this.onDestroy();
                fps.destroyFluidPageState(this.name, this.fluidId);
            };


            this.watch = page.watch ? page.watch.split(",") : undefined;


            var def = {};
            angular.copy(this, def);
            this.default = def;
            console.debug("fluidPage-FluidPageg-newPage.page", this);
            return this;
        };
        return fluidPage;
    }])
    .service("fluidPageService", ["$templateCache", "$q", "$sce", "$timeout", function (tc, q, sce) {
        this.pages = [];
        this.states = [];

        this.pageState = function (name) {

            if (this.states[name] !== undefined) {
                return this.states[name];
            } else {
                var state = {
                    $updated: undefined,
                    $cached: false,
                    tasks: []
                };
                this.states[name] = state;
                return this.states[name];
            }

        };
        this.fluidPageState = function (page, fluidId) {

            var state = this.pageState(page);

            if (state.tasks[fluidId] !== undefined) {
                return state.tasks[fluidId];
            } else {
                var fluidPageState = {
                    $dirty: false,
                    $lastUpdated: undefined,
                    $history: [],
                    $currentState: 0
                };
                state.tasks[fluidId] = fluidPageState;
                return fluidPageState;
            }

        };
        this.destroyFluidPageState = function (page, fluidId) {
            var state = this.pageState(page);
            if (state.tasks[fluidId] != null) {
                state.tasks[fluidId] = null;
            }
        };
        this.destroyState = function (name) {
            if (this.states[name] != null) {
                this.states[name] = null;
            }
        };

        this.loadAjax = function (fluidPage) {
            var fps = this;
            return q(function (resolve) {
                if (fluidPage.ajax) {

                    var ajax = fluidPage.ajax;
                    if (ajax.auto === undefined) {
                        ajax.auto = true;
                    }
                    if (ajax.auto) {
                        var $updated;

                        var state = fps.pageState(fluidPage.name);
                        var fluidState = fps.fluidPageState(fluidPage.name, fluidPage.fluidId);


                        console.debug("fluidPage-fluidPageService-loadAjax.state", state);
                        console.debug("fluidPage-fluidPageService-loadAjax.fluidState", fluidState);
                        console.debug("fluidPage-fluidPageService-loadAjax.fluidPage", fluidPage);

                        $updated = state.$updated ? fluidState.$lastUpdated < state.$updated : false;

                        if (!$updated && fluidPage.watch) {
                            for (var i = 0; i < fluidPage.watch.length; i++) {
                                var watch = fluidPage.watch[i];
                                console.debug("fluidPage-fluidPageService-loadAjax.watch", watch);
                                var watchedState = fps.pageState(watch);
                                console.debug("fluidPage-fluidPageService-loadAjax.watchedState", watchedState);
                                $updated = watchedState.$updated ? fluidState.$lastUpdated < watchedState.$updated : false;
                                if ($updated) {
                                    break;
                                }
                            }
                        }


                        if ($updated) {
                            $updated = !fluidState.$dirty;

                        }

                        if (ajax.data) {
                            console.debug("fluidPage-fluidPageService.ajax.data", ajax.data);
                            if (fluidPage.isNew || fluidPage.isRefreshed || $updated) {
                                if (!fluidPage.cached) {
                                    fluidPage.cached = {}
                                }
                                fluidPage.isNew = false;
                                fluidPage.isRefreshed = false;
                                fluidState.$lastUpdated = new Date().getTime();
                                angular.extend(fluidPage.cached, ajax.data);
                                fluidPage.cached.__proto__ = ajax.data.__proto__;
                                resolve(fluidPage.cached);
                            }
                        }

                        if (fluidPage.isNew || fluidPage.isRefreshed || $updated) {
                            if (!fluidPage.cached) {
                                fluidPage.cached = {}
                            }
                            if (ajax.isArray) {
                                var query = fluidPage.resource.query(fluidPage.ajax.param, function () {
                                    fluidPage.isNew = false;
                                    fluidPage.isRefreshed = false;
                                    fluidPage.cached = query;
                                    fluidState.$lastUpdated = new Date().getTime();
                                    resolve(query);
                                });
                            } else {
                                fluidPage.resource.get(fluidPage.ajax.param, function (data) {
                                    fluidPage.isNew = false;
                                    fluidPage.isRefreshed = false;
                                    fluidState.$lastUpdated = new Date().getTime();
                                    angular.extend(fluidPage.cached, data);
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

