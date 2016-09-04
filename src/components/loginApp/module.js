(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'ngMaterial',
        'znk.infra.user'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                'form-lock': 'components/loginApp/svg/form-lock.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]).config([
        'InfraConfigSrvProvider',
        function (InfraConfigSrvProvider) {

            function globalStorage(GlobalStorageSrv) {
                'ngInject';
                return GlobalStorageSrv;
            }

            InfraConfigSrvProvider.setStorages(globalStorage);
        }
    ]);

})(angular);
