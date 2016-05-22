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
                'check-mark': 'components/diagnosticDrv/svg/check-mark-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

