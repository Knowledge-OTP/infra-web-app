(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .config(
            function (SvgIconSrvProvider) {
                'ngInject';
                var svgMap = {
                    'purchase-check-mark': 'components/purchase/svg/check-mark-icon.svg',
                    'purchase-close-popup': 'components/purchase/svg/purchase-close-popup.svg',
                    'purchase-popup-bullet-1-icon': 'components/purchase/svg/purchase-popup-bullet-1-icon.svg',
                    'purchase-popup-bullet-2-icon': 'components/purchase/svg/purchase-popup-bullet-2-icon.svg',
                    'purchase-popup-bullet-3-icon': 'components/purchase/svg/purchase-popup-bullet-3-icon.svg',
                    'purchase-popup-bullet-4-icon': 'components/purchase/svg/purchase-popup-bullet-4-icon.svg',
                    'purchase-popup-bullet-5-icon': 'components/purchase/svg/purchase-popup-bullet-5-icon.svg',
                    'purchase-raccoon-logo-icon': 'components/purchase/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            });
})(angular);
