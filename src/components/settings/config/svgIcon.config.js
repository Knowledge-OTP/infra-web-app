(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'settings-change-password-icon': 'components/settings/svg/change-password-icon.svg',
                'settings-danger-red-icon': 'components/settings/svg/error-icon.svg',
                'settings-close-popup': 'components/settings/svg/setting-close-popup.svg',
                'settings-completed-v-icon': 'components/settings/svg/completed-v.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);
