(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('WebAppInfraConfigSrv',
        function () {
            'ngInject';
            this.$get = [
                function () {
                    var webAppInfraConfigSrv = {};
                    return webAppInfraConfigSrv;
                }
            ];
        });
})(angular);
