(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.auth',
        'demoEnv',
        'znk.infra.svgIcon',
        'ngMaterial',
        'znk.infra.user',
        'satellizer',
        'znk.infra.general'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                'form-lock': 'components/loginApp/svg/form-lock.svg',
                'facebook-icon': 'components/loginApp/svg/facebook-icon.svg',
                'google-icon': 'components/loginApp/svg/google-icon.svg',
                'login-username-icon': 'components/loginApp/svg/login-username-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(window, angular);
