(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('WebAppInfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var webAppInfraConfigSrv = {};
                    return webAppInfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);
