(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "WORKOUTS_DIAGNOSTIC_INTRO":{
                            "HEADER_TITLE": "Diagnostic Test: {{subject}}"
                        },
                        "WORKOUTS_DIAGNOSTIC_EXERCISE":{
                            "HEADER_TITLE": "Diagnostic Test: {{subject}}"
                        },
                        "WORKOUTS_DIAGNOSTIC_SUMMARY": {
                            "YOUR_INITIAL_SCORE_ESTIMATE": "YOUR INITIAL ESTIMATED SCORE",
                            "ESTIMATED_SCORE": "ESTIMATED SCORE",
                            "YOUR_GOAL": "Your Goal:",
                            "VERBAL": "VERBAL",
                            "MATH": "MATH",
                            "DONE": "DONE",
                            "EVALUATE_START": "We've just designed a personalized training roadmap to help you improve in all four subjects.",
                            "GREAT_START": "That’s a great start! You're on the path to an excellent score!",
                            "GOOD_START": "Good work! We’ve personalized your roadmap to make you an expert in no time.",
                            "BAD_START": "Nice start! We've just designed a special roadmap to help you improve in all four subjects.",
                            "GOAL_TOOLTIP": "{{ptsToGoal}} pts to go!"
                        },
                        "WORKOUTS_DIAGNOSTIC_PRE_SUMMARY": {
                            "READY": "Ready to see your scores?"
                        }
                    }
                );
            });
})(angular);
