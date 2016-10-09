(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.auth',
        'znk.infra.svgIcon',
        'znk.infra.general',
        'znk.infra.storage',
        'znk.infra.user'
    ])
    .config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'settings-change-password-icon': 'components/myProfile/svg/change-password-icon.svg',
                'settings-danger-red-icon': 'components/myProfile/svg/error-icon.svg',
                'settings-close-popup': 'components/myProfile/svg/close-popup.svg',
                'settings-completed-v-icon': 'components/myProfile/svg/completed-v.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
