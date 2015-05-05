/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidPage", ["fluidHttp"])
    .directive("fluidPage", ["$templateCache", "fluidPageService", "FluidPage", function (tc, fps, FluidPage) {
        return {
            restrict: "E",
            scope: {page: "="},
            replace: true,
            template: tc.get("templates/fluid/fluidPage.html"),
            link: function (scope, element, attr) {

                scope.fluidPageService = fps;

                if (scope.page) {
                    scope.fluidPage = new FluidPage(scope.page.name);
                }

                scope.load = function () {
                    //TODO: set load here
                }

            }

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
        var fluidPage = function (name) {
            console.info("FluidPage-FluidPage.page", name);
            if (fps.pages[name] != null) {
                return fps.pages[name];
            } else {
                this.name = name;

                this.preLoad = function (page) {
                }
                this.onLoad = function (data) {
                }

                fps.pages[name] = this;
            }
            return this;
        }

        return fluidPage;
    }])

    .service("fluidPageService", ["$templateCache", function (tc) {
        this.pages = [];
        this.pageHomes = [];
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
                this.pageHomes[page.home] = page;

                return page.home;
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