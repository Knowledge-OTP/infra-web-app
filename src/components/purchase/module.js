(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase',
        [
            'ngAnimate',
            'ui.router',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum',
            'znk.infra.config',
            'znk.infra.storage',
            'znk.infra.auth',
            'znk.infra.analytics'
        ])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'check-mark': 'components/purchase/svg/check-mark-icon.svg',
                    'close-popup': 'components/purchase/svg/close-popup.svg',
                    'purchase-popup-bullet-1-icon': 'components/purchase/svg/purchase-popup-bullet-1-icon.svg',
                    'purchase-popup-bullet-2-icon': 'components/purchase/svg/purchase-popup-bullet-2-icon.svg',
                    'purchase-popup-bullet-3-icon': 'components/purchase/svg/purchase-popup-bullet-3-icon.svg',
                    'purchase-popup-bullet-4-icon': 'components/purchase/svg/purchase-popup-bullet-4-icon.svg',
                    'purchase-popup-bullet-5-icon': 'components/purchase/svg/purchase-popup-bullet-5-icon.svg',
                    'raccoon-logo-icon': 'components/purchase/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);
