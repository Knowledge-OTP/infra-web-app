(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.auth',
        'znk.infra.svgIcon',
        'ngMaterial',
        'satellizer',
        'znk.infra.user',
        'znk.infra.general',
        'znk.infra.autofocus',
        'znk.infra-web-app.promoCode'
    ]);
})(angular);
