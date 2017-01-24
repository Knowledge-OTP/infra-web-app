(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.activePanel', [
        'znk.infra.svgIcon',
        'znk.infra.calls',
        'znk.infra.filters',
        'pascalprecht.translate',
        'znk.infra.screenSharing',
        'znk.infra.presence',
        'znk.infra.znkTooltip',
        'znk.infra-web-app.liveSession'
    ]);
})(angular);
