'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutController',
        function ($state, data, ExerciseStatusEnum, ExerciseResultSrv) {
            'ngInject';

            function _setExerciseResultOnDataObject() {
                return ExerciseResultSrv.getExerciseResult(data.exercise.exerciseTypeId, data.exercise.exerciseId).then(function (exerciseResult) {
                    data.exerciseResult = exerciseResult;
                    return exerciseResult;
                });
            }

            function _goToState(stateName) {
                var EXPECTED_CURR_STATE = 'app.workouts.roadmap.workout';
                if ($state.current.name === EXPECTED_CURR_STATE) {
                    $state.go(stateName);
                }
            }

            switch (data.exercise.status) {
                case ExerciseStatusEnum.ACTIVE.enum:
                    if (angular.isUndefined(data.exercise.exerciseId) || angular.isUndefined(data.exercise.exerciseTypeId)) {
                        _goToState('.intro');
                    } else {
                        _setExerciseResultOnDataObject().then(function (result) {
                            if (result.isComplete) {
                                _goToState('.preSummary');
                            } else {
                                _goToState('.inProgress');
                            }
                        });
                    }
                    break;
                case ExerciseStatusEnum.COMPLETED.enum:
                    _setExerciseResultOnDataObject().then(function () {
                        _goToState('.summary');
                    });
                    break;
                default:
                    _goToState('.intro');
            }
        }
    );
})();
