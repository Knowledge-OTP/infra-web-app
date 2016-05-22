(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader', ['ngAnimate', 'ngMaterial', 'znk.infra.svgIcon', 'pascalprecht.translate'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){
                var svgMap = {
                    'raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);
