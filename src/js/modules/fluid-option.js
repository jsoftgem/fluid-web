/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidOption", [])
    .directive("fluidOption", ["$templateCache", "fluidOptionService", "$window", function (tc, fos, w) {
        return {
            restrict: "AE",
            scope: false,
            replace: true,
            transclude: true,
            template: tc.get("templates/fluid/fluidOption.html"),
            link: function (scope, element, attr) {

                scope.$watch(function (scope) {
                    return element.parent().height();
                }, function (height) {
                    scope.parentHeight = height;
                    var template = element.find(".fluid-option-template");
                    template.css("width", element.parent().width());
                    element.css("width", element.parent().width());

                });

                scope.close = function () {
                    fos.closeOption(element.attr("id"));
                }

                $(w).on("resize", function () {
                    var template = element.find(".fluid-option-template");
                    template.css("width", element.parent().width());
                    element.css("width", element.parent().width());
                });


            }
        }
    }])
    .service("fluidOptionService", ["$compile", function (c) {

        this.openOption = function (optionId, template, source) {
            console.info("fluidOptionService-openOption-source", source);

            var fluidOption = $("#" + optionId);
            var content = $("#" + template);
            var fluidScope = angular.element(fluidOption).scope();
            var fluidTemplate = fluidOption.find(".fluid-option-template");
            var fluidBottom = fluidOption.find(".fluid-option-bottom");
            var contentScope = angular.element(content).scope();
            var sourceID = $(source).attr("id");

            console.info("fluidOptionService-openOption-pre-sourceID", sourceID);

            if (!sourceID) {
                var eventSourceCount = $("[id*='_event_source_id']").length;
                sourceID = fluidOption.attr("id") + "_event_source_id_" + eventSourceCount;
                $(source).attr("id", sourceID);
            }

            console.info("fluidOptionService-openOption-sourceID", sourceID);

            fluidOption.css("max-height", fluidScope.parentHeight);

            fluidTemplate.css("max-height", fluidScope.parentHeight - 15);

            fluidOption.attr("source-event", sourceID);

            fluidBottom.removeClass("hidden")

            c(fluidTemplate.html(content.html()))(contentScope);

        }

        this.closeOption = function (optionId) {
            var fluidOption = $("#" + optionId);
            var fluidTemplate = fluidOption.find(".fluid-option-template");
            var fluidBottom = fluidOption.find(".fluid-option-bottom");
            fluidOption.css("max-height", 0);
            fluidTemplate.css("max-height", 0);
            fluidOption.removeAttr("source-event");
            fluidBottom.addClass("hidden");
        }

    }]);
