(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticIntro', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.config',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'diagnostic-intro-check-mark': 'components/diagnosticIntro/svg/diagnostic-intro-check-mark-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

