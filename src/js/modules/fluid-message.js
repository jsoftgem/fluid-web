/**
 * Created by jerico on 4/28/2015.
 */
angular.module("fluidMessage", ["fluidOption"])
    .service("fluidMessageService", ["$timeout", function (t) {
        var fluidMessageService = {};

        fluidMessageService.duration = 1000;

        fluidMessageService.info = function (id, message, duration) {
            fluidMessageService.id = id;
            fluidMessageService.message = message;
            fluidMessageService.alertType = "alert alert-info";
            fluidMessageService.duration = duration;
            return fluidMessageService;
        };

        fluidMessageService.warning = function (id, message, duration) {
            fluidMessageService.id = id;
            fluidMessageService.message = message;
            fluidMessageService.alertType = "alert alert-warning";
            fluidMessageService.duration = duration;
            return fluidMessageService;
        };

        fluidMessageService.danger = function (id, message, duration) {
            fluidMessageService.id = id;
            fluidMessageService.message = message;
            fluidMessageService.alertType = "alert alert-danger";
            fluidMessageService.duration = duration;
            return fluidMessageService;
        };

        fluidMessageService.success = function (id, message, duration) {
            fluidMessageService.id = id;
            fluidMessageService.message = message;
            fluidMessageService.alertType = "alert alert-success";
            fluidMessageService.duration = duration;
            return fluidMessageService;
        };

        fluidMessageService.open = function () {
            var messageId = "#" + fluidMessageService.id;

            var alerts = $(messageId).find("div[fluid-msg]").get();

            var index = 0;
            if (alerts) {
                index = alerts.length;
            }

            var alertContainer = $(messageId).get();
            var alert = $("<div>").attr("fluid-msg", index)/*.addClass("animated pulse anim-dur")*/.addClass(fluidMessageService.alertType).appendTo(alertContainer).get();

            $("<button>").attr("type", "button").addClass("close icon-cross").attr("data-dismiss", "alert").appendTo(alert).get();

            $("<span>").html(fluidMessageService.message).appendTo(alert);

            t(function () {
                $(alert).remove();
            }, fluidMessageService.duration);
        };

        fluidMessageService.close = function (messageId) {
            $(messageId).find("p").html("");
            $(messageId).removeClass(fluidMessageService.alertType);
            $(messageId).alert('close');
        };

        return fluidMessageService;
    }])
    .factory("FluidMessage", ["$timeout", "FluidOption", function (t, FluidOption) {

        var fluidMessage = function (fluidPanel, option) {
            this.duration = option.duration;
            this.template = option.template;
            this.fluidId = fluidPanel.id;
            this.layout = "text-info bg-info";
            this.message = "";

            var option = new FluidOption(fluidPanel);


            this.info = function (message) {
                this.layout = "text-info";
                this.message = message;
                option.info();
                return this;
            }

            this.success = function (message) {
                this.layout = "text-success";
                this.message = message;
                option.success();
                return this;
            }

            this.danger = function (message) {
                this.layout = "text-danger";
                this.message = message;
                option.danger();
                return this;
            }
            this.warning = function (message) {
                this.layout = "text-warning";
                this.message = message;
                option.warning();
                return this;
            }

            this.open = function ($event) {
                fluidPanel.$scope.fluidMessage = this;
                fluidPanel.frame.$().scrollTop(0);
                option.open(this.template, $event.currentTarget);
                t(function () {
                    /* option.close();*/
                }, this.duration);
            }


        }


        return fluidMessage;


    }]);