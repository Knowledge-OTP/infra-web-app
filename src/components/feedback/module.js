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
        .config(
            function (SvgIconSrvProvider) {
                'ngInject';
                var svgMap = {
                    'feedback-close-popup': 'components/feedback/svg/feedback-close-popup.svg',
                    'feedback-icon': 'components/feedback/svg/feedback-icon.svg',
                    'completed-v-feedback-icon': 'components/feedback/svg/completed-v-feedback.svg',
                    'feedback-btn-icon': 'components/feedback/svg/feedback-btn-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            });
})(angular);
