(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader',
        ['ngAnimate',
            'ngMaterial',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'ui.router',
            'znk.infra-web-app.purchase',
            'znk.infra-web-app.onBoarding',
            'znk.infra-web-app.userGoalsSelection',
            'znk.infra-web-app.settings',
            'znk.infra.user',
            'znk.infra.general',
            'znk.infra-web-app.invitation',
            'znk.infra-web-app.feedback'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'znkHeader-raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg',
                    'znkHeader-check-mark-icon': 'components/znkHeader/svg/znk-header-check-mark-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);
