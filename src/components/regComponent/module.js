(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.regComponent', [
        'pascalprecht.translate',
        'znk.infra.svgIcon'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/regComponent/svg/form-envelope.svg',
                'form-lock': 'components/regComponent/svg/form-lock.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);
