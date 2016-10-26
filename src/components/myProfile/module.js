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
                'myProfile-icon': 'components/myProfile/svg/profile-icon.svg',
                'myProfile-danger-red-icon': 'components/myProfile/svg/error-icon.svg',
                'myProfile-close-popup': 'components/myProfile/svg/close-popup.svg',
                'myProfile-completed-v-icon': 'components/myProfile/svg/completed-v.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
