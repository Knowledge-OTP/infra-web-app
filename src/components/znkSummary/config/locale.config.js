(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ZNK_SUMMARY":{
                            "SUCCESS": "success",
                            "CORRECT": "Correct",
                            "AVG": "Avg",
                            "SEC": "sec",
                            "WRONG": "Missed",
                            "SKIPPED": "Skipped",
                            "CATEGORY": "Category",
                            "ESTIMATED_SCORE": "{{subjectName}} Estimated Score",
                            "MASTERY_LEVEL": "Mastery Level",
                            "MASTERY": "mastery",
                            "REVIEW": "REVIEW",
                            "TEST_TITLE": "Test Score:"
                        }
                    }
                );
            });
})(angular);
