/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPage", ["fluidHttp"])
    .directive("fluidPage", ["$templateCache", "fluidPageService", "FluidPage", "$compile", "FluidBreadcrumb",
        function (tc, fps, FluidPage, c, FluidBreadcrumb) {
            return {
                restrict: "E",
                scope: {page: "=", fluidPanel: "="},
                template: tc.get("templates/fluid/fluidPage.html"),
                link: {
                    pre: function (scope, element, attr) {

                        scope.fluidPageService = fps;

                        scope.loadPage = function (page) {
                            console.info("fluidPage-loadPage.page", page);
                            if (scope.fluidPanel.pages[scope.page.name] != null) {
                                scope.fluidPage = scope.fluidPanel.pages[scope.page.name];
                            } else {
                                scope.fluidPanel.pages[scope.page.name] = new FluidPage(page);
                                scope.fluidPage = scope.fluidPanel.pages[scope.page.name];
                                scope.fluidPage.fluidId = scope.fluidPanel.id;

                            }
                            scope.fluidPanel.loaded = false;
                            if (scope.fluidPage.ajax) {
                                fps.loadAjax(scope.fluidPage)
                                    .then(function (data) {
                                        scope.data = data;
                                        element.html("<ng-include class='fluid-page' src='fluidPageService.render(fluidPage)' onload='onLoad()'></ng-include>");
                                        c(element.contents())(scope);
                                    });
                            } else {
                                element.html("<ng-include class='fluid-page' src='fluidPageService.render(fluidPage)' onload='onLoad()'></ng-include>");
                                c(element.contents())(scope);
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
                            scope.fluidPage.false;
                            //TODO: page onLoad error handling
                            scope.fluidPage.onLoad();
                            scope.fluidPanel.loaded = true;
                            scope.fluidPage.true;
                            scope.fluidPanel.goTo(scope.fluidPage.name);
                        }
                    }
                },
                replace: true
            }
        }])
    .factory("FluidPage", ["fluidPageService", "$resource", function (fps, r) {
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
                //TODO: this.$ = $("div#_id_fp_" + fluidPanel.id + " .fluid-breadcrumb");
                this.name = page.name;
                this.id = page.id;
                this.title = page.title;
                this.static = page.static;
                this.html = page.html;
                this.home = page.home;
                this.ajax = page.ajax;
                this.onLoad = function () {
                    return true;
                }
                fps.pages[page.name] = this;
            }
        }
        return fluidPage;
    }])
    .service("fluidPageService", ["$templateCache", "$q", function (tc, q) {
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
            console.info("fluidPage-fluidPageService-render.page", page);
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
                return page.home;
            }

        }
        return this;
    }]);

