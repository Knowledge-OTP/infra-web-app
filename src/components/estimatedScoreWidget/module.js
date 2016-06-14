(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.enum',
        'znk.infra.config',
        'znk.infra.storage',
        'znk.infra.general',
        'znk.infra.exerciseResult',
        'znk.infra.utility',
        'znk.infra.contentAvail',
        'znk.infra.content',
        'znk.infra.znkExercise',
        'znk.infra.scroll',
        'znk.infra.autofocus',
        'znk.infra.exerciseUtility',
        'znk.infra.estimatedScore',
        'znk.infra.scoring',
        'znk.infra.svgIcon',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.diagnostic'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'estimated-score-widget-goals': 'components/estimatedScoreWidget/svg/goals-top-icon.svg',
                'estimated-score-widget-close-popup': 'components/estimatedScoreWidget/svg/close-popup.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
