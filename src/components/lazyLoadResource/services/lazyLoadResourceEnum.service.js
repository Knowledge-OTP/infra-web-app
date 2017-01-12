(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.lazyLoadResource')
        .factory('loadResourceEnum', function () {
                var loadResourceType = {
                    CSS: 'css',
                    SCRIPT: 'script'
                };

                return loadResourceType;
            }
        );
})(angular);
