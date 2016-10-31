
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary').component('znkSummaryTimeline', {
        templateUrl: 'components/znkSummary/templates/znkSummaryTimeline.template.html',
        bindings: {
            exerciseData: '<'
        },
        controller: function(SubjectEnum) {
            'ngInject';

            var vm = this;

            vm.seenSummary = vm.exerciseData.exerciseResult.seenSummary;
            vm.currentSubjectId = vm.exerciseData.exercise.subjectId;
            vm.activeExerciseId = vm.exerciseData.exercise.id;

            vm.subjectName = SubjectEnum.getValByEnum(vm.currentSubjectId);
        },
        controllerAs: 'vm'
    });
})(angular);

