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
            'znk.infra.svgIcon',
            'znk.infra-web-app.znkToast',
            'znk.infra.config',
            'znk.infra.utility'
        ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                let svgMap = {
                    'znkLessonNotes-star': 'components/znkLessonNotes/svg/star.svg',
                    'znkLessonNotes-zoe-new-record': 'components/znkLessonNotes/svg/zoe-new-record-popup-top-icon.svg',
                    'znkLessonNotes-close-popup': 'components/znkLessonNotes/svg/close-popup.svg',
                    'znkLessonNotes-x-icon': 'components/znkLessonNotes/svg/x-icon.svg',
                    'znkLessonNotes-v-icon': 'components/znkLessonNotes/svg/v-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);
