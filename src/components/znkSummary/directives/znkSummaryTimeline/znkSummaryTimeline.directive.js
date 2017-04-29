
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary').component('znkSummaryTimeline', {
        templateUrl: 'components/znkSummary/directives/znkSummaryTimeline/znkSummaryTimeline.template.html',
        bindings: {
            exerciseData: '<'
        },
        controller: function(SubjectEnum) {
            'ngInject';

            var vm = this;

            vm.seenSummary = vm.exerciseData.exerciseResult.seenSummary;
            vm.currentSubjectId = vm.exerciseData.exerciseResult.subjectId;
            vm.activeExerciseId = vm.exerciseData.exerciseResult.exerciseId;

            vm.subjectName = SubjectEnum.getValByEnum(vm.currentSubjectId);
        },
        controllerAs: 'vm'
    });
})(angular);

