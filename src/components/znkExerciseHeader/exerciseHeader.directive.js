export function exerciseHeaderDrv() {
    var directive = {
        scope: {
            options: '=?',
            onClickedQuit: '&?',
            timerData: '=?',
            subjectId: '=',
            sideText: '@',
            totalSlideNum: '@',
            exerciseNum: '@',
            iconName: '@',
            iconClickHandler: '&'
        },
        restrict: 'E',
        require: '?ngModel',
        templateUrl: 'app/components/znkExerciseHeader/exerciseHeader.template.html',
        controller: 'exerciseHeaderController',
        bindToController: true,
        controllerAs: 'vm',
        link: function (scope, element, attrs, ngModel) {
            if (ngModel) {
                ngModel.$render = function () {
                    scope.vm.currentSlideNum = ngModel.$viewValue;
                };
            }
        }
    };
    return directive;
}
