(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                'form-lock': 'components/loginApp/svg/form-lock.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);
