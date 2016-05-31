(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkExerciseHeader', ['$timeout', function($timeout){
        'ngInject';
        return {
            scope: {
                options: '=?',
                onClickedQuit: '&?',
                timerData: '=?',
                subjectId: '=',
                categoryId: '&',
                sideText: '@',
                totalSlideNum: '@',
                exerciseNum: '@',
                iconName: '@',
                iconClickHandler: '&',
                showNoCalcIcon: '&',
                showNoCalcTooltip: '&'
            },
            restrict: 'E',
            require: '?ngModel',
            templateUrl: 'app/components/znkExerciseHeader/exerciseHeader.template.html',
            controller: function (SubjectEnum) {
                'ngInject';
                // required: subjectId
                if (angular.isUndefined(this.subjectId)) {
                    throw new Error('Error: exerciseHeaderController: subjectId is required!');
                }
                console.log(SubjectEnum);
                this.subjectId = +this.subjectId;
                this.categoryId = this.categoryId();
                var categoryId = angular.isDefined(this.categoryId) ? this.categoryId : this.subjectId;
                console.log(categoryId);
              //  var classUtil = new ExerciseHeaderUtil(SubjectEnum, categoryId, TestScoreCategoryEnum);
              //  this.subjectName = classUtil.getSubjectName();
            },
            bindToController: true,
            controllerAs: 'vm',
            link: function (scope, element, attrs, ngModel) {
                if (ngModel) {
                    ngModel.$render = function () {
                        scope.vm.currentSlideNum = ngModel.$viewValue;
                    };
                }

                if (scope.vm.showNoCalcIcon()) {
                    $timeout(function () {    // timeout fixing md-tooltip visibility issues
                        scope.vm.showToolTip = scope.vm.showNoCalcTooltip();
                    });
                }
            }
        };
    }]);
})(angular);
