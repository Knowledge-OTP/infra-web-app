(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').provider('ExerciseSubjectSrv',
        function () {
            var getSubjectIdFn = function (CategoryService){
                'ngInject';
                return function(exerciseTypeId, catIds) {
                    CategoryService.getCategoryLevel1ParentSync(catIds);
                };
            };

            this.setGetSubjectIdFn = function (_getSubjectIdFn) {
                getSubjectIdFn = _getSubjectIdFn;
            };

            this.$get = function ($log, $injector) {
                'ngInject';
                var ExerciseSubjectSrv = {};

                ExerciseSubjectSrv.getSubjectId = function(exerciseTypeId, catIds) {
                    var fn;
                    if (angular.isDefined(getSubjectIdFn)) {
                        try {
                            fn = $injector.invoke(getSubjectIdFn);
                        } catch(e) {
                            $log.error('exerciseCycleSrv invoke: failed to invoke getSubjectIdFn! e: '+ e);
                            return;
                        }

                        return fn.apply(catIds);
                    }
                };

                return ExerciseSubjectSrv;
            };
        }
    );
})(angular);
