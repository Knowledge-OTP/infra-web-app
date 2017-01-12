(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.lazyLoadResource')
        .service('loadResourceSrv', function (loadResourceEnum, $log, $q, $window, $document) {


                this.addResource = function (src, type, loc) {
                    if (type === loadResourceEnum.SCRIPT) {
                        return _addScript(src, loc);
                    }
                    if (type === loadResourceEnum.CSS) {
                        return _addStyle(src);
                    }
                    $log.error('loadResourceSrv: enum type is not defined');
                };
                this.removeResource = function (src, type) {
                    if (type === loadResourceEnum.SCRIPT) {
                        return _removeScript(src, type);
                    }
                    if (type === loadResourceEnum.CSS) {
                        return _removeStyle(src, type);
                    }
                    $log.error('loadResourceSrv: enum type is not defined');
                };
                this.isResourceLoaded = function (src, type) {
                    return _getResourceList(src, type).length > 0;
                };

                function _addScript(src, loc) {
                    var location = loc || 'body';
                    var deferred = $q.defer();
                    var element = $document.find(location).eq(0);
                    var script = $window.document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = src;
                    element.append(script);
                    script.onload = function (event) {
                        deferred.resolve(event);
                    };
                    return deferred.promise;
                }

                function _addStyle(src) {
                    var deferred = $q.defer();
                    var headElement = $document.find('head').eq(0);
                    var link = $window.document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = src;
                    headElement.append(link);
                    link.onload = function (event) {
                        deferred.resolve(event);
                    };
                    return deferred.promise;
                }

                function _removeScript(src, type) {
                    var scriptItem = _getResourceList(src, type);
                    if (scriptItem.length) {
                        var scriptElement = angular.element(scriptItem[0]);
                        scriptElement.remove();
                    }
                    else {
                        $log.error('loadResourceSrv: script resource is not found');
                    }
                }

                function _removeStyle(src, type) {
                    var styleItem = _getResourceList(src, type);
                    if (styleItem.length) {
                        var styleElement = angular.element(styleItem[0]);
                        styleElement.remove();
                    }
                    else {
                        $log.error('loadResourceSrv: style resource is not found');
                    }
                }

                function _getResourceList(src, type) {
                    var resourceList;
                    if (type === loadResourceEnum.SCRIPT) {
                        resourceList = $window.document.querySelector('script[src="' + src + '"]');
                    }
                    if (type === loadResourceEnum.CSS) {
                        resourceList = $window.document.querySelector('link[href="' + src + '"]');
                    }
                    if (resourceList) {
                        return Array.prototype.slice.call(resourceList);
                    }
                    return [];
                }
            }
        );
})(angular);
