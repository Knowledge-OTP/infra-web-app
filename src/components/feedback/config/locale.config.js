(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback')
        .config(
            function ($translateProvider) {
                'ngInject';
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
