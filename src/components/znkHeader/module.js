(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader',
        ['ngAnimate',
            'ngMaterial',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra-web-app.purchase'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg',
                    'purchase-popup-bullet-1-icon': 'components/znkHeader/svg/purchase-popup-bullet-1-icon.svg',
                    'purchase-popup-bullet-2-icon': 'components/znkHeader/svg/purchase-popup-bullet-2-icon.svg',
                    'purchase-popup-bullet-3-icon': 'components/znkHeader/svg/purchase-popup-bullet-3-icon.svg',
                    'purchase-popup-bullet-4-icon': 'components/znkHeader/svg/purchase-popup-bullet-4-icon.svg',
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);
