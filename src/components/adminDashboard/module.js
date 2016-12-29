(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.general',
        'znk.infra.storage',
        'znk.infra.user',
        'ui.router',
        'znk.infra-web-app.znkToast',
        'znk.infra-web-app.elasticSearch',
        'znk.infra-web-app.myProfile',
        'ui.grid',
        'ui.grid.selection',
        'ui.grid.autoResize'
    ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'adminProfile-icon': 'components/adminDashboard/components/eMetadata/svg/admin-profile-icon.svg',
                    'adminProfile-close-popup': 'components/adminDashboard/components/eMetadata/svg/admin-profile-close-popup.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);
