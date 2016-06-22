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
                'tests-check-mark-icon': 'components/tests/svg/check-mark-icon.svg',
                'tests-locked-icon': 'components/tests/svg/locked-icon.svg',
                'tests-subject-locked-icon': 'components/tests/svg/subject-locked-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }

    ]);
})(angular);
