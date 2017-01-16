'use strict';
angular.module('znk.infra-web-app.tutorials').component('tutorialPane', {
    templateUrl: 'components/tutorials/components/tutorialPane/tutorialPane.template.html',
    require: {
        ngModelCtrl: '^ngModel'
    },
    controllerAs: 'vm',
    controller: function ($translatePartialLoader, TutorialsSrv, $q, SubjectEnum) {
        var vm = this;
        $translatePartialLoader.addPart('tutorials');
        var subjectOrderProm = TutorialsSrv.getSubjectOrder();
        vm.subjectsMap = SubjectEnum.getEnumMap();
        
        vm.$onInit = function () {
            $q.all([
                subjectOrderProm
            ]).then(function (res) {
                vm.subjecstOrder = res[0];
                if (!vm.activeSubject) {
                    vm.activeSubject = vm.subjecstOrder[0];
                    vm.ngModelCtrl.$setViewValue(+vm.subjecstOrder[0]);
                }
            });

            vm.changeActiveSubject = function (subjectId) {
                vm.ngModelCtrl.$setViewValue(+subjectId);
                vm.activeSubject = vm.ngModelCtrl.$viewValue;
            };
        };
    }
});
