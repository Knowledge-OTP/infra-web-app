(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise', [
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
        'znk.infra.scoring',
        'znk.infra.general',
        'znk.infra.filters',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra-web-app.infraWebAppZnkExercise',
        'znk.infra-web-app.workoutsRoadmap'
    ]).config(function(SvgIconSrvProvider) {
        'ngInject';
        var svgMap = {
            'diagnostic-dropdown-arrow-icon': 'components/diagnosticExercise/svg/dropdown-arrow.svg',
            'diagnostic-check-mark': 'components/diagnosticExercise/svg/check-mark-icon.svg',
            'diagnostic-flag-icon': 'components/diagnosticExercise/svg/flag-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    });
})(angular);
