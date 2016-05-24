(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget', [
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
