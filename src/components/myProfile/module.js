(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.myProfile', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.auth',
        'znk.infra.svgIcon',
        'znk.infra.general',
        'znk.infra.storage',
        'znk.infra.user',
        'znk.infra.exerciseUtility',
        'znk.infra-web-app.znkToast'
    ]);
})(angular);
