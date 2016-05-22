(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'ui.router',
        'znk.infra.enum',
        'znk.infra.exerciseUtility'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {};
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
