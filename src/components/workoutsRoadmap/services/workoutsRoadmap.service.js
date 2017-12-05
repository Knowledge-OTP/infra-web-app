(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv',
        function () {
            'ngInject';
            var _newSubjectToIgnoreGetter;

            this.setSubjectToIgnoreGetter = function (newWorkoutGeneratorGetter) {
                _newSubjectToIgnoreGetter = newWorkoutGeneratorGetter;
            };

            var _workoutAvailTimesGetter;
            this.setWorkoutAvailTimes = function (workoutAvailTimesGetter) {
                _workoutAvailTimesGetter = workoutAvailTimesGetter;
            };

            this.$get = function ($injector, $log, $q, PersonalizationSrv) {

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function (subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn) {

                    if (!angular.isArray(subjectToIgnoreForNextDaily)) {
                        subjectToIgnoreForNextDaily = subjectToIgnoreForNextDaily ? [subjectToIgnoreForNextDaily] : [];
                    }
                    //if _newSubjectToIgnoreGetter is not defined then call personalization with the current subjectToIgnoreForNextDaily  , else invoke 'invokedSubjectToIgnore' function from the web-app.
                    if (!angular.isFunction(_newSubjectToIgnoreGetter)) {
                        return PersonalizationSrv.getPersonalizedExercise(subjectToIgnoreForNextDaily, workoutOrder);
                    }
                    else {
                        var invokedSubjectToIgnoreFunc = $injector.invoke(_newSubjectToIgnoreGetter);
                        return $q.when(invokedSubjectToIgnoreFunc(subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn)).then(function (subjectToIgnore) {
                            return PersonalizationSrv.getPersonalizedExercise(subjectToIgnore, workoutOrder);
                        });

                    }
                };
                WorkoutsRoadmapSrv.getWorkoutAvailTimes = function () {
                    if (!_workoutAvailTimesGetter) {
                        var errMsg = 'WorkoutsRoadmapSrv: workoutAvailTimesGetter wsa not defined!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    var workoutAvailTimes;
                    if (angular.isFunction(_workoutAvailTimesGetter)) {
                        workoutAvailTimes = $injector.invoke(_workoutAvailTimesGetter);
                    } else {
                        workoutAvailTimes = _workoutAvailTimesGetter;
                    }

                    return $q.when(workoutAvailTimes);
                };

                return WorkoutsRoadmapSrv;
            };
        });
})(angular);
