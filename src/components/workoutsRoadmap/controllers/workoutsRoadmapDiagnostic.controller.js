(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticController',
        function ($state, ExerciseStatusEnum, data, $timeout, CategoryService) {
            'ngInject';
            //  fixing page not rendered in the first app entrance issue
            $timeout(function () {
                switch (data.diagnostic.status) {
                    case ExerciseStatusEnum.COMPLETED.enum:
                        var workoutSubjectId = CategoryService.getCategoryLevel1ParentSync(data.workoutsProgress[0]);
                        var isFirstWorkoutStarted = angular.isDefined(workoutSubjectId);
                        if (isFirstWorkoutStarted) {
                            $state.go('.summary');
                        } else {
                            $state.go('.preSummary');
                        }
                        break;
                    default:
                        $state.go('.intro');
                }
            });
        });
})();
