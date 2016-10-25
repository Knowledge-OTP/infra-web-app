(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "WORKOUTS_ROADMAP_DIAGNOSTIC_INTRO":{
                            "DIAGNOSTIC_TEST": "Diagnostic Test",
                            "START_TEST": "START TEST",
                            "CONTINUE_TEST": "CONTINUE TEST"
                        },
                        "WORKOUTS_ROADMAP_DIAGNOSTIC_SUMMERY": {
                            "DIAGNOSTIC_TEST": "Diagnostic Test",
                            "DIAG_RES_TEXT": "Your Results"
                        },
                        "ROADMAP_BASE_PRE_SUMMARY": {
                            "DIAGNOSTIC_TEST": "Diagnostic Test",
                            "COMPLETE": "Completed!",
                            "WORKOUT": "Workout"
                        },
                        "WORKOUTS_ROADMAP_WORKOUT_INTRO":{
                            "TITLE": "Workout {{workoutOrder}}",
                            "CHANGE_SUBJECT": "Change subject",
                            "HOW_MUCH_TIME": "How much time do you have?",
                            "WORKOUT_TIME": "WORKOUT_TIME",
                            "START": "START",
                            "MINUTES": "minutes"
                        },
                        "WORKOUTS_ROADMAP_WORKOUT_IN_PROGRESS":{
                            "TITLE": "Workout {{workoutOrder}}",
                            "KEEP_GOING": "Let's keep going!",
                            "ANSWERED": "Answered: {{answered}}/{{total}}",
                            "CONTINUE": "CONTINUE"
                        },
                        "WORKOUTS_ROADMAP_WORKOUT_INTRO_LOCK":{
                            "TITLE": "Workout {{workoutOrder}}",
                            "DIAGNOSTIC_NOT_COMPLETED": "This workout will be available after you have <br>completed the diagnostic test",
                            "PREV_NOT_COMPLETED": "Complete the previous workout to unlock this workout",
                            "MORE_WORKOUTS": "Want to get one more workout for free?",
                            "TELL_FRIENDS": "Tell friends about us!",
                            "SHARE": "SHARE",
                            "UPGRADE": "Upgrade",
                            "GET_ZINKERZ_PRO": "Get Zinkerz PRO to unlock all workouts.",
                            "MORE_PRACTICE": "Do you feel like you need more practice? Or do you <br>want to be 100% sure you’re ready for the test?"
                        }
                    }
                );
            });
})(angular);
