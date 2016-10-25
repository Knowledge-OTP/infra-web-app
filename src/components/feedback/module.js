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
            function (SvgIconSrvProvider, $translateProvider) {
                'ngInject';
                var svgMap = {
                    'feedback-close-popup': 'components/feedback/svg/feedback-close-popup.svg',
                    'feedback-icon': 'components/feedback/svg/feedback-icon.svg',
                    'completed-v-feedback-icon': 'components/feedback/svg/completed-v-feedback.svg',
                    'feedback-btn-icon': 'components/feedback/svg/feedback-btn-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);

                $translateProvider.translations('en', {
                    "FEEDBACK_POPUP": {
                        "FEEDBACK"       : "Feedback",
                        "REQUIRED_FIELD" : "This field is required.",
                        "CORRECT_EMAIL"  : "Please enter a valid email address",
                        "EMAIL"          : "Your email address",
                        "MESSAGE"        : "Send us your comments or suggestions...",
                        "SEND"           : "Send",
                        "THINK"          : "Let us know what you think!",
                        "THANKS"         : "Thank you!",
                        "OPINION"        : "Your feedback is important to us.",
                        "DONE"           : "Done",
                        "USER_EMAIL"     : "email: {{userEmail}}",
                        "USER_ID"        : "uid: {{userId}}"
                    }
                });
            });
})(angular);
