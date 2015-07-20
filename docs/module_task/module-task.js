/**
 * Created by Jerico on 7/9/2015.
 */
angular.module("moduleTask", ["fluid", "ui.ace"])
    .controller("moduleTaskCtrl", ["$scope", "$compile", "fluidFrameService", function (scope, c, FluidFrame) {


        scope.tab = "source";

        angular.forEach(scope.fluidPanel.toolbarItems, function (toolbar, $index) {

            if (toolbar.is("createTaskToolbar")) {
                toolbar.visible = function () {
                    return scope.fluidPanel.currentPage().name === "taskOverview";
                };
                toolbar.action = function (task, $event) {
                    scope.fluidPanel.goTo("taskEditor", $event, {
                        param: {"isNew": true}
                    });
                };
            }
            else if (toolbar.is("saveTaskToolbar")) {
                toolbar.visible = function () {
                    return scope.fluidPanel.currentPage().name === "taskEditor";
                };
                toolbar.action = function (task, $event) {
                    scope.save($event);
                };
            }
            else if (toolbar.is("addNewPage")) {
                toolbar.visible = function () {
                    return scope.fluidPanel.currentPage().name === "taskEditor";
                };
                toolbar.action = function (task, $event) {
                    scope.createPage();
                };
            } else if (toolbar.is("removeAllPages")) {
                toolbar.visible = function () {
                    return scope.fluidPanel.currentPage().name === "taskEditor";
                };
                toolbar.action = function (task, $event) {
                    scope.removeAllPage();
                };
            } else if (toolbar.is("removePage")) {
                toolbar.visible = function () {
                    return scope.fluidPanel.currentPage().name === "taskEditor" && scope.page;
                };
                toolbar.action = function (task, $event) {
                    scope.removePage(scope.selectedIndex);
                };
            }
        });


        scope.hello = "Static scope var hello";
        scope.save = function ($event) {
            scope.data.$save().
                then(function (data) {

                }, function (reason) {
                    scope.fluidPanel.message(3000).danger(reason, $event);
                });
        };

        scope.fluidPage.onLoad = function (ok) {

            ok();

            if (this.name === "taskEditor") {
                if (scope.data.pages === null) {
                    scope.data.pages = [];
                }


                console.debug("moduleTask-onLoad.data", scope.data);
            }
        };


        scope.createPage = function () {

            if (scope.data.pages) {
                var home = false;
                if (scope.data.pages.length === 0) {
                    home = true;
                }
                scope.data.pages.push({
                    "id": 0,
                    "name": "",
                    "title": "untitled",
                    "static": false,
                    "html": "",
                    "home": "",
                    "isHome": home,
                    "ajax": {
                        "isArray": false,
                        "url": "",
                        "auto": true
                    },
                    "watch": ""
                });
            }
        };

        scope.editPage = function (page, $index) {
            scope.page = page;
            scope.selectedIndex = $index;
        };

        scope.removePage = function ($index) {
            scope.data.pages.splice($index, 1);
            scope.page = undefined;
            scope.tab = "source";
        };

        scope.removeAllPage = function () {
            scope.data.pages = [];
            scope.page = undefined;
            scope.tab = "source";
        };


        scope.preview = function (page, $event) {

            var valid = true;

            if (scope.data.name && scope.data.title) {
                if (page.name && page.title) {
                } else {
                    scope.fluidPanel.message().danger("Page name and title is required.", $event);
                    valid = false;
                }
            } else {
                scope.fluidPanel.message().danger("Task name and title is required.", $event);
                valid = false;
            }
            if (valid) {
                scope.tab = 'preview';
            }


            console.debug("moduleTask-preview.tab", scope.tab);

            scope.fluidPanel.progress.run("previewHtml", function (ok, cancel) {

                $(scope.fluidPanel.getElementFlowId("pageHtmlFramePreview"))
                    .ready(function () {
                        ok({valid: valid, page: page});
                    });
            });


        };


        scope.fluidPanel.progress.onComplete("previewHtml", function (result) {
            if (result.valid) {
                var fluidFrame = new FluidFrame(scope.fluidPanel.getElementFlowId("pageHtmlFramePreview"));
                console.debug("moduleTask-previewHtml.fluidFrame", fluidFrame);
                fluidFrame.tasks = [];
                fluidFrame.openTaskRaw(scope.data, result.page.name);
            }

        });

        scope.source = function ($event) {
            scope.tab = "source";
        }

    }]);