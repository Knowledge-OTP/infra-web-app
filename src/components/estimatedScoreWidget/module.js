(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget', [
        'ngMaterial',
        'znk.infra.enum',
        'znk.infra.config',
        'znk.infra.storage',
        'znk.infra.exerciseResult',
        'znk.infra.utility',
        'znk.infra.contentAvail',
        'znk.infra.content',
        'znk.infra.znkExercise',
        'znk.infra.scroll',
        'znk.infra.autofocus',
        'znk.infra.exerciseUtility',
        'znk.infra.estimatedScore'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {

            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
