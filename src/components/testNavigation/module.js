(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.testNavigation', [
        'znk.infra.svgIcon',
        'pascalprecht.translate',
        'znk.infra.scoring',
        'znk.infra.exerciseUtility'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
