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
            }
        }
    }])
    .factory("FluidBreadcrumb", ["breadcrumbService", function (bcs) {

        var fluidBreadcrumb = function (fluidPanel) {
            if (bcs.breadcrumbs[fluidPanel.id] != null) {
                return bcs[fluidPanel.id];
            } else {
                this.pages = [];
                this.current = 0;

                this.hasNext = function () {
                    return this.current < (this.pages.length - 1);
                }

                this.hasPrevious = function () {
                    return this.pages.length > 1;
                }

                this.next = function () {
                    if (this.hasNext()) {
                        this.current++;
                    }
                }

                this.previous = function () {
                    if (this.hasPrevious()) {
                        this.current--;
                    }
                }

                this.addPage = function (page) {
                    if (this.pages.indexOf(page.name) > -1) {
                        this.current = this.pages.indexOf(page.name);
                    } else {
                        this.pages.push(page.name);
                    }
                }

                bcs.breadcrumbs[fluidPanel.id] = this;
            }
        }
        return fluidBreadcrumb;

    }])
    .service("breadcrumbService", [function () {
        this.breadcrumbs = [];
        return this;
    }])
