(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes',
        [
            'ngMaterial',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra.auth',
            'znk.infra.user',
            'znk.infra.analytics',
            'znk.infra.general',
            'znk.infra.svgIcon'
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
