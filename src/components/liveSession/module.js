(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession',
        [
            'ngMaterial',
            'znk.infra.znkSessionData',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra.auth',
            'znk.infra.userContext',
            'znk.infra.user',
            'znk.infra.utility',
            'znk.infra.analytics',
            'znk.infra.general',
            'znk.infra.svgIcon',
            'znk.infra-web-app.activePanel',
            'znk.infra-web-app.znkToast',
            'znk.infra.exerciseUtility',
            'znk.infra.znkTooltip'
        ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'liveSession-english-icon': 'components/liveSession/svg/liveSession-verbal-icon.svg',
                    'liveSession-math-icon': 'components/liveSession/svg/liveSession-math-icon.svg',
                    'liveSession-start-lesson-popup-icon': 'components/liveSession/svg/liveSession-start-lesson-popup-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);
