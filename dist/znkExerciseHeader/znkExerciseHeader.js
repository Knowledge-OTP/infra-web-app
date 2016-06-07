(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkExerciseHeader', [
        'pascalprecht.translate',
        'ngMaterial',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.general'
    ]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkExerciseHeader').directive('znkExerciseHeader', ['$timeout', function($timeout){
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
            templateUrl: 'components/znkExerciseHeader/templates/exerciseHeader.template.html',
            controller: function (SubjectEnum, $translatePartialLoader) {
                'ngInject';
                $translatePartialLoader.addPart('znkExerciseHeader');
                // required: subjectId
                if (angular.isUndefined(this.subjectId)) {
                    throw new Error('Error: exerciseHeaderController: subjectId is required!');
                }
                this.subjectId = +this.subjectId;
                this.categoryId = this.categoryId();
                var categoryId = angular.isDefined(this.categoryId) ? this.categoryId : this.subjectId;
                this.subjectName = SubjectEnum.getValByEnum(categoryId);
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

angular.module('znk.infra-web-app.znkExerciseHeader').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkExerciseHeader/templates/exerciseHeader.template.html",
    "<div class=\"exercise-header subject-repeat\" subject-id-to-attr-drv=\"vm.subjectId\"\n" +
    "     context-attr=\"class\" suffix=\"bg\" translate-namespace=\"CONTAINER_HEADER\">\n" +
    "   <div class=\"pattern\" subject-id-to-attr-drv=\"vm.subjectId\" context-attr=\"class\" prefix=\"subject-background\"></div>\n" +
    "\n" +
    "    <div class=\"left-area\">\n" +
    "        <div class=\"side-text\" translate=\"{{vm.sideText | cutString: 40}}\" translate-values=\"{subjectName: vm.subjectName, exerciseNum: vm.exerciseNum}\"></div>\n" +
    "\n" +
    "        <div ng-if=\"vm.showNoCalcIcon()\" class=\"no-math-icon-wrapper\">\n" +
    "            <div class=\"math-no-calc\"></div>\n" +
    "            <svg-icon name=\"math-icon\" class=\"icon-wrapper\"></svg-icon>\n" +
    "\n" +
    "            <md-tooltip md-visible=\"vm.showToolTip\" ng-if=\"vm.showToolTip\" md-direction=\"bottom\" class=\"no-calc-tooltip md-whiteframe-3dp\">\n" +
    "                <div class=\"arrow-up\"></div>\n" +
    "                <div translate=\".NO_CALC_TOOLTIP\" class=\"top-text\"></div>\n" +
    "                <div translate=\".GOT_IT\" class=\"md-button primary got-it-btn\" ng-click=\"vm.showToolTip = false\"></div>\n" +
    "            </md-tooltip>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"center-num-slide\" ng-if=\"vm.options.showNumSlide\">{{vm.currentSlideNum}}/{{::vm.totalSlideNum}}</div>\n" +
    "    <div class=\"review-mode\" ng-if=\"vm.options.reviewMode\" ui-sref=\"^.summary\">\n" +
    "        <div class=\"background-opacity\"></div>\n" +
    "        <div class=\"summary-text\" translate=\".SUMMARY\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"right-area\">\n" +
    "        <svg-icon class=\"header-icon\" ng-if=\"vm.iconName\" name=\"{{vm.iconName}}\" ng-click=\"vm.iconClickHandler(); vm.showToolTip = false\"></svg-icon>\n" +
    "\n" +
    "        <div class=\"date-box\" ng-if=\"vm.options.showDate\">\n" +
    "            <timer type=\"1\" ng-model=\"vm.timerData.timeLeft\" play=\"true\" config=\"vm.timerData.config\"></timer>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"quit-back-button\" translate=\".QUIT_BTN_TEXT\" ng-if=\"vm.options.showQuit\" ng-click=\"vm.onClickedQuit()\"></div>\n" +
    "</div>\n" +
    "");
}]);
