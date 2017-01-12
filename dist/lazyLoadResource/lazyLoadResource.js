(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.lazyLoadResource', []);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.lazyLoadResource')
        .service('loadResourceSrv', ["loadResourceEnum", "$log", "$q", "$window", "$document", function (loadResourceEnum, $log, $q, $window, $document) {
                var bodyElement = $document.find('body').eq(0);

                this.addResource = function (src, type) {
                    if (type === loadResourceEnum.SCRIPT) {
                        return _addScript(src);
                    }
                    if (type === loadResourceEnum.CSS) {
                        return _addStyle(src);
                    }
                    $log.error('loadResourceSrv: enum type is not defined');
                };
                this.removeResource = function (src, type) {
                    if (type === loadResourceEnum.SCRIPT) {
                        return _removeScript(src);
                    }
                    if (type === loadResourceEnum.CSS) {
                        return _removeStyle(src);
                    }
                    $log.error('loadResourceSrv: enum type is not defined');
                };

                function _addScript(src) {
                    var deferred = $q.defer();
                    var script = $window.document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = src;
                    bodyElement.append(script);
                    script.onload = function (event) {
                        deferred.resolve(event);
                    };
                    return deferred.promise;
                }

                function _addStyle(src) {
                    var deferred = $q.defer();
                    var link = $window.document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = src;
                    bodyElement.append(link);
                    link.onload = function (event) {
                        deferred.resolve(event);
                    };
                    return deferred.promise;
                }

                function _removeScript(src) {
                    var scriptNodes = $window.document.querySelector('script[src="' + src + '"]');
                    var scriptItem = Array.prototype.slice.call(scriptNodes);
                    if (scriptItem.length) {
                        var scriptElement = angular.element(scriptItem[0]);
                        scriptElement.remove();
                    }
                    else {
                        $log.error('loadResourceSrv: script resource is not found');
                    }
                }

                function _removeStyle(src) {
                    var styleNodes = $window.document.querySelector('link[href="' + src + '"]');
                    var styleItem = Array.prototype.slice.call(styleNodes);
                    if (styleItem.length) {
                        var styleElement = angular.element(styleItem[0]);
                        styleElement.remove();
                    }
                    else {
                        $log.error('loadResourceSrv: style resource is not found');
                    }
                }
            }]
        );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.lazyLoadResource')
        .factory('loadResourceEnum', function () {
                var loadResourceType = {
                    CSS: 'css',
                    SCRIPT: 'script'
                };

                return {
                    loadResourceType: loadResourceType
                };
            }
        );
})(angular);

angular.module('znk.infra-web-app.lazyLoadResource').run(['$templateCache', function($templateCache) {

}]);
