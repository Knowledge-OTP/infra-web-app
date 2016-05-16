(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'znk.infra.svgIcon'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {};
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);
