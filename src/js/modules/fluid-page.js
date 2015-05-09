/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPage", ["fluidHttp"])
    .directive("fluidPage", ["$templateCache", "fluidPageService", "FluidPage", function (tc, fps, FluidPage) {
        return {
            restrict: "E",
            scope: {page: "=", fluidPanel: "="},
            template: tc.get("templates/fluid/fluidPage.html"),
            link: {
                pre: function (scope, element, attr) {

                    scope.fluidPageService = fps;

                    scope.$watch(function (scope) {
                        return scope.page;
                    }, function (newPage, oldPage) {
                        if (newPage) {
                            scope.fluidPage = new FluidPage(newPage);
                        }
                        console.info("fluidPage-fluidpage>load", scope.fluidPage);
                    });


                },
                post: function (scope, element, attr) {

                    scope.onLoad = function () {

                        //TODO: set load here
                        if (scope.page.autoGet) {

                        } else {
                            scope.fluidPage.load()
                            scope.fluidPanel.loaded = true;
                        }
                    }
                }
            },
            replace: true

        }
    }])
    .directive("fluidResizePage", ["$window", function ($w) {
        return {
            restrict: "A",
            scope: false,
            link: function (scope, element, attr) {

                if (!scope.task) {
                    throw "[fluidResizePage] Task is required.";
                }

                var w = angular.element($w);
                var parent = element.parent();

                w.bind("resize", function () {
                    autoSizePage(element, parent, scope.task.id);
                });


                scope.$watch(function (scope) {
                    return scope.task.size;
                }, function (newSize, oldSize) {
                    autoSizePage(element, parent, scope.task.id);
                });

                autoSizePage(element, parent, scope.task.id);
            }
        }
    }])
    .factory("FluidPage", ["fluidPageService", function (fps) {
        var fluidPage = function (page) {
            console.info("FluidPage-FluidPage.page", page);
            if (fps.pages[page.name]) {
                return fps.pages[page.name];
            } else {

                this.name = page.name;
                this.id = page.id;
                this.title = page.title;
                this.static = page.static;
                this.html = page.html;
                this.home = page.home;
                this.ajax = page.ajax;

                this.preLoad = function () {
                }
                this.onLoad = function (data) {
                }

                fps.pages[page.name] = this;
            }
        }

        return fluidPage;
    }])
    .service("fluidPageService", ["$templateCache", function (tc) {
        this.pages = [];
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
                return page.name;
            }

        }
        return this;
    }]);

function autoSizePage(element, parent, id) {
    var offsetHeight = 0;
    parent.each(function (index, value) {
        var id = $(value).attr("id");
        if (id === "fluid_page_" + id) {
            var height = parent.innerHeight() - offsetHeight;
            element.height(height);
        }
        offsetHeight += $(value).innerHeight();
    })
    /* var pageWidth = parent.innerWidth() - 2;
     element.width(pageWidth);*/
}