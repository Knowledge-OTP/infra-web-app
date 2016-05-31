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
        'znk.infra-web-app.userGoals'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {

            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
