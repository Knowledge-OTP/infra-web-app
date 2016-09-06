(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback',
        [
            'ngMaterial',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra.auth',
            'znk.infra.analytics',
            'znk.infra.general',
            'znk.infra.user',
            'znk.infra.svgIcon'
        ]);
})(angular);
