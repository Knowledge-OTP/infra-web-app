(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests', [
        'znk.infra.svgIcon',
        'pascalprecht.translate',
        'znk.infra.enum',
        'znk.infra.scoring',
        'znk.infra.exams',
        'znk.infra-web-app.diagnostic',
        'znk.infra.analytics',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.estimatedScoreWidget',
        'znk.infra.exerciseUtility',
        'ui.router'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }

    ]);
})(angular);
