(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic').constant('WORKOUTS_DIAGNOSTIC_FLOW', {
        timeLimit: 3 * 60 * 1000,
        questionsPerSubject: 4,
        levels: {
            very_easy: {
                num: 1
            },
            easy: {
                num: 2
            },
            medium: {
                num: 3
            },
            hard: {
                num: 4
            },
            very_hard: {
                num: 5
            }
        }
    });

})(angular);

