/**
 * Created by rickz_000 on 5/10/2015.
 */
angular.module("fluidBreadcrumb", [])
    .directive("fluidBreadcrumb", ["$templateCache", "FluidBreadcrumb", function (tc, FluidBreadcrumb) {
        return {
            restrict: "E",
            replace: true,
            template: tc.get("templates/fluid/fluidBreadcrumb.html"),
            scope: {fluidPanel: "="},
            link: function (scope, element, attr) {
                scope.breadcrumb = new FluidBreadcrumb(scope.fluidPanel);
                console.info("fluidBreadcrumb.breadcrumb", scope.breadcrumb);
            }
        }
    }])
    .factory("FluidBreadcrumb", ["breadcrumbService", function (bcs) {
        var fluidBreadcrumb = function (fluidPanel) {
            if (bcs.breadcrumbs[fluidPanel.id] != null) {
                return bcs.breadcrumbs[fluidPanel.id];
            } else {

                this.$ = $("div#_id_fp_" + fluidPanel.id + " .fluid-breadcrumb");

                this.fluidId = fluidPanel.id;

                this.pages = [];

                this.current = 0;

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
                    console.info("fluidBreadcrumb.scrollTo.index", index);
                    this.$.scrollTo(this.$.find("div:eq(" + index + ")"), 800);
                }

                bcs.breadcrumbs[fluidPanel.id] = this;

                this.close = function (page, $index) {
                    this.pages.splice($index, 1);
                }
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
                console.info("fluidBreadcrumb-fluidResizeBreadcrumb.element", element);

                var parent = element.parent();

                console.info("fluidBreadcrumb-fluidResizeBreadcrumb.parent", parent[0].clientWidth);
                console.info("fluidBreadcrumb-fluidResizeBreadcrumb.fluidPanel.id", scope.fluidPanel.id);

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
                    console.info("fluidResizeBreadcrumb$watch.fluidPanel.page", page);
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
            console.info("fluidBreadcrumb-autoSizeBreadcrumb.value", value);
            offsetWidth += $(value).width();
            console.info("fluidBreadcrumb-autoSizeBreadcrumb.value.width", $(value).width());
        }
        if (index === lastIndex) {
            console.info("fluidBreadcrumb-autoSizeBreadcrumb.offsetWidth", offsetWidth);
            width -= offsetWidth + 20;
            this.width(width);
            console.info("fluidBreadcrumb-autoSizeBreadcrumb.width", width);
        }
    }, element);
}