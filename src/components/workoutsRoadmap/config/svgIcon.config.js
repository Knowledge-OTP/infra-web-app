(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'workouts-roadmap-checkmark': 'components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg',
                'workouts-roadmap-change-subject': 'components/workoutsRoadmap/svg/change-subject-icon.svg',
                'workouts-intro-lock-dotted-arrow': 'components/workoutsRoadmap/svg/dotted-arrow.svg',
                'workouts-intro-lock-lock': 'components/workoutsRoadmap/svg/lock-icon.svg',
                'workouts-intro-lock-share-arrow': 'components/workoutsRoadmap/svg/share-arrow-icon.svg',
                'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg',
                'workouts-progress-check-mark-icon': 'components/workoutsRoadmap/svg/workout-roadmap-check-mark-icon.svg',
                'workouts-progress-tutorial-icon': 'components/workoutsRoadmap/svg/tutorial-icon.svg',
                'workouts-progress-practice-icon': 'components/workoutsRoadmap/svg/practice-icon.svg',
                'workouts-progress-game-icon': 'components/workoutsRoadmap/svg/game-icon.svg',
                'workouts-progress-drill-icon': 'components/workoutsRoadmap/svg/drill-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        });
})(angular);
