(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(function (SvgIconSrvProvider) {
            'ngInject';
            
            var svgMap = {
                'workouts-roadmap-checkmark': 'components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg',
                'workouts-roadmap-change-subject': 'components/workoutsRoadmap/svg/change-subject-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        });
})(angular);
