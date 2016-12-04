(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkToast')
        .config(function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'znkToast-error-red-icon': 'components/znkToast/svg/znkToast-error-icon.svg',
                'znkToast-close-popup': 'components/znkToast/svg/znkToast-close-popup.svg',
                'znkToast-completed-v-icon': 'components/znkToast/svg/znkToast-completed-v.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        });
})(angular);
