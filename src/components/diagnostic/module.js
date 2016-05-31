(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic', [
        'pascalprecht.translate',
        'ngMaterial',
        'chart.js',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.analytics',
        'znk.infra.exams',
        'znk.infra.estimatedScore',
        'znk.infra.exerciseUtility',
        'znk.infra.exerciseResult',
        'znk.infra.znkExercise',
        'znk.infra.scroll',
        'znk.infra.stats',
        'znk.infra.category',
        'znk.infra.scoring',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra.general'
    ]).config(function(SvgIconSrvProvider) {
        var svgMap = {
            'diagnostic-dropdown-arrow-icon': 'components/diagnostic/svg/dropdown-arrow.svg',
            'diagnostic-check-mark': 'components/diagnostic/svg/check-mark-icon.svg',
            'diagnostic-flag-icon': 'components/diagnostic/svg/flag-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    });
})(angular);
