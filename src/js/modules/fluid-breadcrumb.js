/**
 * Created by rickz_000 on 5/10/2015.
 */
angular.module("fluidBreadcrumb", [])
    .directive("fluidBreadcrumb", ["$templateCache", "FluidBreadcrumb", function (tc, FluidBreadcrumb) {
        return {
            restrict: "E",
            replace: true,
            template: tc.get("templates/fluid/fluidBreadcrumb.html"),
            scope: false,
            link: function (scope, element, attr) {
                scope.breadcrumb = new FluidBreadcrumb(scope.fluidPanel);
                console.debug("fluidBreadcrumb.breadcrumb", scope.breadcrumb);
            }
        }
    }])
    .factory("FluidBreadcrumb", [function () {
        var fluidBreadcrumb = function (fluidPanel) {
            if (fluidPanel.breadcrumbs[fluidPanel.id] != null) {
                return fluidPanel.breadcrumbs[fluidPanel.id];
            } else {
                this.$ = $("div#_id_fp_" + fluidPanel.id + " .fluid-breadcrumb");
                this.fluidId = fluidPanel.id;
                this.pages = [];
                this.current = 0;
                this.fluidPanel = fluidPanel;
                this.hasNext = function () {
                    return this.current < (this.pages.length - 1);
                }
                this.hasPrevious = function () {
                    return this.current > 0;
                }
                this.next = function () {
                    if (this.hasNext()) {
                        this.current++;
                        this.scrollToCurrent();
                    }
                }
                this.previous = function () {
                    if (this.hasPrevious()) {
                        this.current--;
                        this.scrollToCurrent();
                    }
                }
                this.addPage = function (page) {
                    if (this.pages.indexOf(page.name) > -1) {
                        this.current = this.pages.indexOf(page.name);
                    } else {
                        this.pages.push(page.name);
                        this.current = this.pages.indexOf(page.name);
                    }
                    this.scrollToCurrent();
                }
                this.scrollToCurrent = function () {
                    this.scrollTo(this.current);
                }
                this.scrollTo = function (index) {
                    console.debug("fluidBreadcrumb.scrollTo.index", index);
                    this.$.scrollTo(this.$.find("div:eq(" + index + ")"), 800);
                }
                this.currentPage = function () {
                    return this.pages[this.current];
                }
                this.close = function (page, $index, $event) {
                    this.pages.splice($index, 1);
                    if (this.current > 0) {
                        this.current -= 1;
                    }
                    console.debug("fluidBreadcrumb-FluidBreadcrumb-close.current", this.current);
                }
                this.open = function (page, $index, $event) {
                    this.current = $index;
                }
                this.getTitle = function (bread) {
                    if (this.fluidPanel) {
                        var page = this.fluidPanel.getPage(bread);
                        if (page) {
                            return page.title;
                        }
                    }
                }
                fluidPanel.breadcrumbs[fluidPanel.id] = this;

            }
        }
        return fluidBreadcrumb;
    }])
    .service("breadcrumbService", [function () {
        this.breadcrumbs = [];
        return this;
    }])
    .directive("fluidResizeBreadcrumb", ["$window", "FluidBreadcrumb", function ($w, FluidBreadcrumb) {
        return {
            restrict: "A",
            scope: false,
            link: function (scope, element, attr) {

                var w = angular.element($w);
                console.debug("fluidBreadcrumb-fluidResizeBreadcrumb.element", element);

                var parent = element.parent();

                console.debug("fluidBreadcrumb-fluidResizeBreadcrumb.parent", parent[0].clientWidth);
                console.debug("fluidBreadcrumb-fluidResizeBreadcrumb.fluidPanel.id", scope.fluidPanel.id);

                w.bind("resize", function () {
                    if (scope.fluidPanel && scope.fluidPanel.page && scope.fluidPanel.loaded) {
                        autoSizeBreadcrumb(element, parent, scope.fluidPanel.id);
                        var fluidBreadcrumb = new FluidBreadcrumb(scope.fluidPanel);
                        fluidBreadcrumb.scrollToCurrent();
                    }
                });

                scope.$watch(function (scope) {
                    return scope.fluidPanel.page;
                }, function (page) {
                    console.debug("fluidResizeBreadcrumb$watch.fluidPanel.page", page);
                    if (page && scope.fluidPanel.loaded) {
                        autoSizeBreadcrumb(element, parent, scope.fluidPanel.id);
                    }
                })

                //TODO: task size event for breadcrumb
            }
        }
    }]);

function autoSizeBreadcrumb(element, parent, id) {
    var offsetWidth = 0;
    var lastIndex = parent.children().length - 1;

    angular.forEach(parent.children(), function (value, index) {
        var width = parent.innerWidth();
        if (!$(value).hasClass('fluid-breadcrumb')) {
            console.debug("fluidBreadcrumb-autoSizeBreadcrumb.value", value);
            offsetWidth += $(value).width();
            console.debug("fluidBreadcrumb-autoSizeBreadcrumb.value.width", $(value).width());
        }
        if (index === lastIndex) {
            console.debug("fluidBreadcrumb-autoSizeBreadcrumb.offsetWidth", offsetWidth);
            width -= offsetWidth + 20;
            this.width(width);
            console.debug("fluidBreadcrumb-autoSizeBreadcrumb.width", width);
        }
    }, element);
}