(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv', [
        function () {
            var _newSubjectToIgnoreGetter, _newWorkoutGeneratorGetter;

            this.setSubjectToIgnoreGetter = function (newWorkoutGeneratorGetter) {
                _newSubjectToIgnoreGetter = newWorkoutGeneratorGetter;
            };
            this.setNewWorkoutGeneratorGetter = function (newWorkoutGeneratorGetter) {
                _newWorkoutGeneratorGetter = newWorkoutGeneratorGetter;
            };


            var _workoutAvailTimesGetter;
            this.setWorkoutAvailTimes = function (workoutAvailTimesGetter) {
                _workoutAvailTimesGetter = workoutAvailTimesGetter;
            };

            this.$get = function ($injector, $log, $q, PersonalizationSrv) {
                'ngInject';

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function (subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn) {
                    var getter, invokedFunc;

                    if (!angular.isFunction(_newWorkoutGeneratorGetter) && !angular.isFunction(_newSubjectToIgnoreGetter)) {
                        var errMsg = 'WorkoutsRoadmapSrv: getter function was not defined!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }
                    if (!angular.isArray(subjectToIgnoreForNextDaily)) {
                        subjectToIgnoreForNextDaily = subjectToIgnoreForNextDaily ? [subjectToIgnoreForNextDaily] : [];
                    }
                    getter = _newSubjectToIgnoreGetter || _newWorkoutGeneratorGetter;
                    invokedFunc = $injector.invoke(getter);

                    if (_newSubjectToIgnoreGetter) {
                        return $q.when(invokedFunc(subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn)).then(function (subjectToIgnore) {
                            if (angular.isUndefined(subjectToIgnore)) {   //in case the 'subjectToIgnore' property was not returned from app config
                                subjectToIgnore = subjectToIgnoreForNextDaily;
                            }
                            return PersonalizationSrv.getPersonalizedExercise(subjectToIgnore, workoutOrder);
                        });
                    }
                    else {
                        return $q.when(invokedFunc(subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn));
                    }
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
