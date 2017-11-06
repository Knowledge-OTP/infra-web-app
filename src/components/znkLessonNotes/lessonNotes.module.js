(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes',
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
            'znk.infra-web-app.diagnostic',
            'znk.infra-web-app.activePanel',
            'znk.infra-web-app.znkToast',
            'znk.infra.exerciseUtility',
            'znk.infra.znkTooltip',
            'znk.infra.calls'
        ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                const svgMap = {
                    'znkLessonNotes-star': 'components/znkLessonNotes/svg/star.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);
