
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary').component('znkSummaryTimeline', {
        templateUrl: 'components/znkSummary/templates/znkSummaryTimeline.template.html',
        bindings: {
            exerciseData: '<'
        },
        controller: function(SubjectEnum, CategoryService) {
            'ngInject';

            var vm = this;

            vm.seenSummary = vm.exerciseData.exerciseResult.seenSummary;
            
            vm.currentSubjectId = CategoryService.getCategoryLevel1ParentSync(vm.exerciseData.exercise);
            vm.activeExerciseId = vm.exerciseData.exercise.id;

            vm.subjectName = SubjectEnum.getValByEnum(vm.currentSubjectId);
        },
        controllerAs: 'vm'
    });
})(angular);

