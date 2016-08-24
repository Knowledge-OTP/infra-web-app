(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'settings-change-password-icon': 'components/settings/svg/change-password-icon.svg',
                'settings-danger-red-icon': 'components/settings/svg/error-icon.svg',
                'settings-close-popup': 'components/settings/svg/close-popup.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);
