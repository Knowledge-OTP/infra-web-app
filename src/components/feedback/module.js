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
        ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'close-popup': 'components/feedback/svg/close-popup.svg',
                    'feedback-icon': 'components/feedback/svg/feedback-icon.svg',
                    'completed-v-feedback-icon': 'components/feedback/svg/completed-v-feedback.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);
