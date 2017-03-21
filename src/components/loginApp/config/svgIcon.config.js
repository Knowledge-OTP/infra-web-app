(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp')
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                    'form-lock': 'components/loginApp/svg/form-lock.svg',
                    'facebook-icon': 'components/loginApp/svg/facebook-icon.svg',
                    'google-icon': 'components/loginApp/svg/google-icon.svg',
                    'login-username-icon': 'components/loginApp/svg/login-username-icon.svg',
                    'dropdown-arrow': 'components/loginApp/svg/dropdown-arrow.svg',
                    'v-icon': 'components/loginApp/svg/v-icon.svg',
                    'loginApp-arrow-icon': 'components/loginApp/svg/arrow-icon.svg',
                    'loginApp-close-icon': 'components/loginApp/svg/close-icon.svg',
                    'loginApp-correct-icon': 'components/loginApp/svg/correct-icon.svg',
                    'microsoft-icon': 'components/loginApp/svg/microsoft.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);
