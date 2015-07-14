/**
 * Created by Jerico on 7/9/2015.
 */
angular.module("moduleTask", ["fluid"])
    .controller("moduleTaskCtrl", ["$scope", "ToolBarItem", function (scope, ToolbarItem) {
        var createToolbar = new ToolbarItem();
        createToolbar.label = "New task";
        createToolbar.setId("createTaskToolbar");
        createToolbar.visible = function () {
            return scope.fluidPanel.currentPage().name === "taskOverview";
        };
        createToolbar.uiClass = "btn btn-info";
        createToolbar.action = function (task, $event) {
            scope.fluidPanel.goTo("taskEditor", $event, {
                param: {"isNew": true}
            });
        };
        createToolbar.glyph = "fa fa-plus";
        scope.fluidPanel.addToolbarItem(createToolbar);
        var saveToolbar = new ToolbarItem();
        saveToolbar.label = "Save";
        saveToolbar.setId("saveTaskToolbar");
        saveToolbar.visible = function () {
            return scope.fluidPanel.currentPage().name === "taskEditor";
        };
        saveToolbar.uiClass = "btn btn-success";
        saveToolbar.action = function (task, $event) {
            scope.save($event);
        };
        saveToolbar.glyph = "fa fa-save";
        scope.fluidPanel.addToolbarItem(saveToolbar);
        scope.fluidPage.onLoad(function (data) {

        });


        scope.hello  ="Static scope var hello";

        scope.save = function ($event) {
            scope.data.$save().
                then(function (data) {

                }, function (reason) {
                    scope.fluidPanel.message(3000).danger(reason, $event);
                });
        }


    }]);