(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('InfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var InfraConfigSrv = {};

                    return InfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);
