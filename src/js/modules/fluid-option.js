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
                scope.close = function () {
                    fos.closeOption(element.attr("id"));
                }
            }
        }
    }])
    .directive("fluidOptionTemplate", ["$templateCache", function (tc) {
        return {
            restrict: "E",
            scope: {scope: "@"},//@Param scope {'task', 'page', 'new'}
            transclude: true,
            link: function (s, element, attr) {

                if (!s.scope) {
                    s.scope = "task";
                }

                if (!attr.id) {
                    throw "fluidOptionTemplate ID is required.";
                }
                var templateId = attr.id;
                console.debug("fluidOptionTemplate.templateId", templateId);
                tc.put(templateId, element.html());
            },
            replace: true,
            template: "<div ng-transclude style='display: none; position: absolute; height: 0px;/*width: 0px;*/padding: 0;margin: 0'></div>"
        }
    }])
    .factory("FluidOption", ["fluidOptionService", "$compile", "$templateCache", function (fos, c, tc) {
        var fluidOption = function (fluidPanel) {
            if (fos.fluidOptions[fluidPanel.id] != null) {
                fos.fluidOptions[fluidPanel.id].$().removeClass("bg-info").removeClass("bg-warning").removeClass("bg-success").removeClass("bg-danger");
                return fos.fluidOptions[fluidPanel.id];
            } else {
                this.fluidId = fluidPanel.id;
                this.$ = function () {
                    return $("#fluid_option_" + this.fluidId);
                }
                this.open = function (template, source, page) {
                    console.debug("FluidOption-openOption-source", source);
                    var templateId = template /*+ "_" + this.fluidId*/;
                    var fluidOption = this.$();
                    console.debug("fluidOption-openOption.option", fluidOption);
                    var fluidScope = angular.element(fluidOption).scope();
                    var fluidTemplate = fluidOption.find(".fluid-option-template");
                    var fluidBottom = fluidOption.find(".fluid-option-bottom");

                    if (source) {
                        var sourceID = $(source).attr("id");
                        console.debug("FluidOption-openOption-pre-sourceID", sourceID);
                        if (!sourceID) {
                            var eventSourceCount = $("[id*='_event_source_id']").length;
                            sourceID = fluidOption.attr("id") + "_event_source_id_" + eventSourceCount;
                            $(source).attr("id", sourceID);
                        } else {
                            var eventSourceCount = $("[id*='_event_source_id']").length;
                            sourceID = "event_source_id_" + eventSourceCount;
                            $(source).attr("id", sourceID);
                        }

                        fluidOption.attr("source-event", sourceID);
                    }

                    console.debug("FluidOption-openOption-sourceID", sourceID);
                    var parentHeight = fluidPanel.$().innerHeight();
                    console.debug("FluidOption-openOption.parentHeight", parentHeight);
                    fluidOption.css("max-height", parentHeight);
                    fluidTemplate.css("max-height", parentHeight - 15);
                    fluidBottom.removeClass("hidden")
                    console.debug("FluidOption-openOption.templateId", templateId);
                    var html = tc.get(templateId);
                    console.debug("FluidOption-openOption.html", html);
                    if (page) {
                        console.debug("fluidOption-FluidOption.page", page);
                        console.debug("fluidOption-FluidOption.pageScope", page.$scope());
                        c(fluidTemplate.html(html))(page.$scope());
                    } else {
                        c(fluidTemplate.html(html))(fluidPanel.$scope());
                    }
                    this.isOpen = true;
                }
                this.close = function () {
                    var fluidOption = $("#fluid_option_" + this.fluidId);
                    var fluidTemplate = fluidOption.find(".fluid-option-template");
                    var fluidBottom = fluidOption.find(".fluid-option-bottom");
                    fluidOption.css("max-height", 0);
                    fluidTemplate.css("max-height", 0);
                    fluidOption.removeAttr("source-event");
                    fluidBottom.addClass("hidden");
                    this.isOpen = false;
                }
                this.info = function () {
                    this.$().addClass("bg-info");
                    return this;
                }
                this.danger = function () {
                    this.$().addClass("bg-danger");
                    return this;
                }
                this.success = function () {
                    this.$().addClass("bg-success");
                    return this;
                }
                this.warning = function () {
                    this.$().addClass("bg-warning");
                    return this;
                }
                this.isOpen = false;

                this.isCancelled = false;

                this.putTemplate = function (name, template) {
                    tc.put(name, template);
                }

                fos.fluidOptions[fluidPanel.id] = this;
            }
        };

        return fluidOption;
    }])
    .service("fluidOptionService", ["$compile", "$templateCache", "$timeout", function (c, tc, t) {
        this.fluidOptions = [];
        this.clear = function (id) {
            this.fluidOptions[id] = undefined;
        }
        this.openOption = function (optionId, template, source) {
            console.debug("fluidOptionService-openOption-source", source);
            var fluidOption = $("#" + optionId);
            var content = $("#" + template);
            var fluidScope = angular.element(fluidOption).scope();
            var fluidTemplate = fluidOption.find(".fluid-option-template");
            var fluidBottom = fluidOption.find(".fluid-option-bottom");
            var contentScope = angular.element(content).scope();
            var sourceID = $(source).attr("id");
            console.debug("fluidOptionService-openOption-pre-sourceID", sourceID);
            if (!sourceID) {
                var eventSourceCount = $("[id*='_event_source_id']").length;
                sourceID = fluidOption.attr("id") + "_event_source_id_" + eventSourceCount;
                $(source).attr("id", sourceID);
            } else {
                var eventSourceCount = $("[id*='_event_source_id']").length;
                sourceID = "event_source_id_" + eventSourceCount;
                $(source).attr("id", sourceID);
            }
            console.debug("fluidOptionService-openOption-sourceID", sourceID);
            var parentHeight = fluidScope.parentHeight < 50 ? 60 : fluidScope.parentHeight;
            fluidOption.css("max-height", parentHeight);
            fluidTemplate.css("max-height", parentHeight - 10);
            fluidOption.attr("source-event", sourceID);
            fluidBottom.removeClass("hidden")
            if (contentScope) {
                c(fluidTemplate.html(content.html()))(contentScope);
            } else {
                var page = fluidOption.parent().find(".fluid-page");
                page.ready(function () {
                    var pageScope = angular.element(page).scope();
                    console.debug("fluidOption-fluidOptionService.page", page);
                    console.debug("fluidOption-fluidOptionService.pageScope", pageScope);
                    c(fluidTemplate.html(content.html()))(pageScope);
                });
            }
        }
        this.closeOption = function (optionId) {
            var fluidOption = $("#" + optionId);
            var fluidTemplate = fluidOption.find(".fluid-option-template");
            var fluidBottom = fluidOption.find(".fluid-option-bottom");
            fluidOption.css("min-height", undefined);
            fluidOption.css("max-height", 0);
            fluidTemplate.css("max-height", 0);
            fluidOption.removeAttr("source-event");
            fluidBottom.addClass("hidden");
        }

        var fluidOptions = this.fluidOptions;

        function check() {
            console.debug("fluidOption-fluidOptionService.fluidOptions", fluidOptions);
            t(check, 1000);
        }
    }]);
