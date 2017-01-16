(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader',
        [   'ngAnimate',
            'ngMaterial',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'ui.router',
            'znk.infra-web-app.purchase',
            'znk.infra-web-app.onBoarding',
            'znk.infra-web-app.userGoalsSelection',
            'znk.infra-web-app.myProfile',
            'znk.infra.user',
            'znk.infra-web-app.activePanel',
            'znk.infra-web-app.feedback'])
        .config(function(SvgIconSrvProvider){
                'ngInject';
                var svgMap = {
                    'znkHeader-raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg',
                    'znkHeader-check-mark-icon': 'components/znkHeader/svg/check-mark-icon.svg',
                    'znkHeader-app-name-logo': 'assets/svg/znk-app-name-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            });
})(angular);
