(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'ui.router',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'ngAnimate',
        'znk.infra.scroll'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
