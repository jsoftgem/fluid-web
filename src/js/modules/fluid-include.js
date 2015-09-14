/**
 * Created by jerico on 9/14/15.
 */
angular.module("fluidInclude", [])
    .directive('fluidInclude', ['$http', '$compile', '$timeout', "$templateCache", function (h, c, t, tc) {
        return {
            restrict: 'AE',
            link: function link($scope, elem, attrs) {
                $scope.loaderTemplate = "templates/fluid/fluidPageLoader.html";
                $scope.errorTemplate = "templates/fluid/fluidPageError.html";
                $scope.retry = 0;
                $scope.retryCount = 10;

                if (attrs.retryCount) {
                    scope.retryCount = attrs.retryCount;
                }
                if (attrs.complete) {
                    $scope.complete = attrs.complete;
                }
                if (attrs.failed) {
                    $scope.failed = attrs.failed;
                }


                if (attrs.errorTemplate) {
                    $scope.errorTemplate = attrs.errorTemplate;
                }

                if (attrs.loaderTemplate) {
                    $scope.loaderTemplate = attrs.loaderTemplate;
                }

                elem.html(tc.get($scope.loaderTemplate));

                if (tc.get(attrs.url)) {
                    elem.html(c(angular.element(tc.get(attrs.url)))($scope));
                    t(function () {
                        if ($scope.complete) {
                            $scope.$eval($scope.complete);
                        }
                    }, 1, false);
                }
                else if (attrs.url) {
                    function getPage() {
                        $scope.retry++;
                        h({
                            method: 'GET',
                            url: attrs.url,
                            cache: true,
                            headers: {"Content-Type": "text/html", "Fluid-Type": "fluid-include"}
                        }).then(function (result) {
                            console.debug("fluid-include.result", result);
                            console.debug("fluid-include.$scope.retry", $scope.retry);
                            if (result) {
                                tc.put(attrs.url, result.data);
                                elem.html(c(angular.element(result.data))($scope));
                                t(function () {
                                    if ($scope.complete) {
                                        $scope.$eval($scope.complete);
                                    }
                                }, 1, false);
                            } else {
                                if ($scope.retry < $scope.retryCount) {
                                    t(getPage, 5000, false);
                                } else {
                                    if ($scope.failed) {
                                        $scope.$eval($scope.failed);
                                    }
                                    elem.html(c(angular.element(tc.get($scope.errorTemplate)))($scope));
                                }
                            }

                        }, function () {
                            if ($scope.retry < $scope.retryCount) {
                                t(getPage, 5000, false);
                            } else {
                                if ($scope.failed) {
                                    $scope.$eval($scope.failed);
                                }
                                elem.html(c(angular.element(tc.get($scope.errorTemplate)))($scope));
                            }
                        });
                    }

                    getPage();
                }
            }
        };
    }]);