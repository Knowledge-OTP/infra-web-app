(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ANSWER_EXPLANATION":{
                            "ANSWER_EXPLANATION": "Answer explanation",
                            "TITLE": "Why is this right?"
                        },
                        "CONTAINER_HEADER": {
                            "QUIT_BTN_TEXT": "Exit",
                            "SUMMARY": "Summary",
                            "DIAGNOSTIC_TEXT": "Diagnostic Test: {{subjectName}}",
                            "FULL_TEST_TEXT": "Full Test {{exerciseNum}}: {{subjectName}}",
                            "MINI_TEST_TEXT": "Mini Test {{exerciseNum}}: {{subjectName}}",
                            "NO_CALC_TOOLTIP": "This workout do not permit the use of a calculator.",
                            "GOT_IT": "Got it"
                        }
                    }
                );
            });
})(angular);
