(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticDrv', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.config',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'plus-icon': 'components/onBoarding/svg/plus-icon.svg',
                'on-boarding-heart': 'components/onBoarding/svg/onboarding-heart-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

