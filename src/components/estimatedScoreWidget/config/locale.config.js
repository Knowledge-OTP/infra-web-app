(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ESTIMATED_SCORE_WIDGET_DIRECTIVE": {
                            "PTS_TO_GO": "You are {{pts}}pt away",
                            "YOUR_GOAL": "Your Goal: {{goal}}",
                            "GOAL_REACHED": "you've reached your goal!",
                            "COMPOSITE_SCORE": "Total Score:",
                            "GOAL_SCORE": "Goal Score:",
                            "EDIT_MY_GOALS": "Edit my goals",
                            "0": "Math",
                            "1": "English",
                            "7": "Verbal",
                            "8": "Essay",
                            "UNFINISHED_DIAGNOSTIC_TITLE": "Set your initial score by completing the diagnostic test."
                        },
                        "SETTING.EDIT_GOALS": {
                            "MY_GOALS": "My Goals"
                        }
                    }
                );
            });
})(angular);
