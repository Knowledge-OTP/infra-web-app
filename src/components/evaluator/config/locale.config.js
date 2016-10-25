(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "EVALUATE_RESULT_DRV": {
                            "WEAK": "Weak",
                            "LIMITED": "Limited",
                            "FAIR": "Fair",
                            "GOOD": "Good",
                            "POINTS": "({{pts}} pts)"
                        },
                        "EVALUATE_REVIEW_STATES_DRV": {
                            "UPGRADE_BTN": "Upgrade to Pro",
                            "PENDING_TITLE": "Your answer is pending evaluation.",
                            "PENDING_DESC": "This may take a few days. We will notify you when the evaluation is ready.",
                            "EVALUATED_ANSWER_TITLE": "Answer evaluation:"
                        },
                        "EVALUATE_QUESTION_RESULT_DRV": {
                            "COMPLETED": "Completed",
                            "SKIPPED": "Skipped"
                        }
                    }
                );
            });
})(angular);
