'use strict';
angular.module('znk.infra-web-app.tutorials').component('tutorialList', {
    templateUrl: 'components/tutorials/components/tutorialList/tutorialList.template.html',
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        tutorials: '<'
    },
    controllerAs: 'vm',
    controller: function (SubjectEnum, DiagnosticSrv, ExerciseStatusEnum) {
        var vm = this;
        vm.subjectsMap = SubjectEnum.getEnumMap();
        vm.isDiagnosticComplete = true;
        DiagnosticSrv.getDiagnosticStatus().then(function (diagnosticStatus) {
            vm.isDiagnosticComplete = diagnosticStatus === ExerciseStatusEnum.COMPLETED.enum;
        });
        vm.tutorialsArrs = vm.tutorials;

        vm.$onInit = function () {
            vm.ngModelCtrl.$render = function () {
                vm.activeSubject = vm.ngModelCtrl.$modelValue;
            };
        };
    }
});
