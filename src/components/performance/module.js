(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.performance', [
        'ngMaterial',
        'pascalprecht.translate'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
