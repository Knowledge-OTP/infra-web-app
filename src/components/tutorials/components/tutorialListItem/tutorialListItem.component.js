'use strict';
angular.module('znk.infra-web-app.tutorials').component('tutorialListItem', {
    templateUrl: 'components/tutorials/components/tutorialListItem/tutorialListItem.template.html',
    require: {
        ngModelCtrl: '^ngModel'
    },
    bindings: {
        tutorial: "<"
    },
    controllerAs: 'vm',
    controller: function (SubjectEnum, DiagnosticSrv, ExerciseStatusEnum, purchaseService, $state) {
        var vm = this;
        vm.subjectsMap = SubjectEnum.getEnumMap();

        DiagnosticSrv.getDiagnosticStatus().then(function (diagnosticStatus) {
            var isDiagnosticComplete = diagnosticStatus === ExerciseStatusEnum.COMPLETED.enum;
            vm.tutorialClick = function (tutorialId) {
                if (!isDiagnosticComplete) { return; }
                if (vm.tutorial.isAvail) {
                    $state.go('app.tutorial', {
                        exerciseId: tutorialId
                    });
                } else {
                    purchaseService.showPurchaseDialog();
                }
            };
        });

        vm.$onInit = function () {
            vm.ngModelCtrl.$render = function () {
                vm.activeSubject = vm.ngModelCtrl.$viewValue;
            };
        };
    }
});
