(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticIntro')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "DIAGNOSTIC_INTRO": {
                            "QUESTIONS": "questions",
                            "INSTRUCTIONS_TITLE": "Instructions:"
                        }
                    }
                );
            });
})(angular);
