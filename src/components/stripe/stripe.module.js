(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.stripe',
        [
            'ngAnimate',
            'ui.router',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum',
            'znk.infra.config',
            'znk.infra.storage',
            'znk.infra.auth',
            'znk.infra.analytics'
        ]);
})(angular);

