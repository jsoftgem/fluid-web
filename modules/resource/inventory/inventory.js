angular.module("portfolio.inventory", ["inventoryPages"]).controller("homeCtrl", ["$scope", function (scope) {
    scope.fluidPage.load = function (data) {
        scope.inventoryData = data
    }
}]), angular.module("inventoryPages", ["modules/inventory/pages/home.html"]), angular.module("modules/inventory/pages/home.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("modules/inventory/pages/home.html", '<div class="container-fluid"><fluid-subtable key-var="inv" label="Inventory" model="inventoryData"><fluid-subcolumn name="description" header="Description"><div class="coloumn-row">{{inv.description}}</div><div class="column-form"><label class="control-label width100pc">Description <input class="form-control" ng-model="inv.description"></label></div></fluid-subcolumn></fluid-subtable></div>')
}]);