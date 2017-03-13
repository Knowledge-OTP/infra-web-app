(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv', [
        function () {
            var _newSubjectToIgnoreGetter;
            this.setSubjectToIgnoreGetter = function (newWorkoutGeneratorGetter) {
                _newSubjectToIgnoreGetter = newWorkoutGeneratorGetter;
            };


            var _workoutAvailTimesGetter;
            this.setWorkoutAvailTimes = function (workoutAvailTimesGetter) {
                _workoutAvailTimesGetter = workoutAvailTimesGetter;
            };

            this.$get = function ($injector, $log, $q, PersonalizationSrv) {
                'ngInject';

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function (subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn) {
                    if (!_newSubjectToIgnoreGetter) {
                        var errMsg = 'WorkoutsRoadmapSrv: newSubjectToIgnoreGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    if (!angular.isArray(subjectToIgnoreForNextDaily)) {
                        subjectToIgnoreForNextDaily = subjectToIgnoreForNextDaily ? [subjectToIgnoreForNextDaily] : [];
                    }

                    var newSubjectToIgnoreGetter = $injector.invoke(_newSubjectToIgnoreGetter);
                    return $q.when(newSubjectToIgnoreGetter(subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn)).then(function (subjectToIgnore) {
                       //in case the 'subjectToIgnore' property was not returned from app config
                        if (angular.isUndefined(subjectToIgnore)) {
                            subjectToIgnore = subjectToIgnoreForNextDaily;
                        }
                        return PersonalizationSrv.getPersonalizedExercise(subjectToIgnore, workoutOrder);
                    });
                };

                WorkoutsRoadmapSrv.getWorkoutAvailTimes = function () {
                    if (!_workoutAvailTimesGetter) {
                        var errMsg = 'WorkoutsRoadmapSrv: workoutAvailTimesGetter wsa not defined !!!!';
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
        }
    ]);
})(angular);
