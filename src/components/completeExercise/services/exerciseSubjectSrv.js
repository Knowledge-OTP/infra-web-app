(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').provider('ExerciseSubjectSrv',
        function () {
            var getSubjectIdFn = function (CategoryService){
                'ngInject';
                return function(exerciseTypeId, catIds) {
                    // The exerciseTypeId is for the fn we set in satsmInfraConfig
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
                    if (angular.isFunction(getSubjectIdFn)) {
                        fn = $injector.invoke(getSubjectIdFn);
                        return fn.apply(exerciseTypeId, catIds);
                    } else {
                        $log.error('exerciseCycleSrv: getSubjectIdFn is not a function !');
                    }
                };

                return ExerciseSubjectSrv;
            };
        }
    );
})(angular);
