(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkExerciseStatesUtility', [
        'ui.router',
        'znk.infra.znkExercise',
        'znk.infra-web-app.infraWebAppZnkExercise'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkExerciseStatesUtility')
        .controller('InfraWebAppExerciseStateCtrl',
            ["$controller", "$scope", "exerciseData", "$filter", "ExerciseTypeEnum", "$sce", "ENV", "SubjectEnum", function ($controller, $scope, exerciseData, $filter, ExerciseTypeEnum, $sce, ENV, SubjectEnum) {
                'ngInject';

                var vm = this;
                
                $scope.vm = this;

                var isSection = exerciseData.exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
                // var isPractice = exerciseData.exerciseTypeId === ExerciseTypeEnum.PRACTICE.enum;
                var isExerciseComplete = exerciseData.exerciseResult.isComplete;
                this.iconClickHandler = exerciseData.iconClickHandler;
                this.iconName = exerciseData.iconName;
                // no calculator icon and tooltip in the exercise header
                if (exerciseData.exercise.subjectId === SubjectEnum.MATH.enum && !exerciseData.exercise.calculator) {
                    vm.showNoCalcIcon = true;
                    if (!exerciseData.exerciseResult.seenNoCalcTooltip) {
                        vm.showNoCalcTooltip = true;
                        exerciseData.exerciseResult.seenNoCalcTooltip = true;
                    }
                }


                var exerciseSettings = {
                    initPagerDisplay: isExerciseComplete || isSection
                };

                this.onHeaderQuit = function () {
                    exerciseData.headerExitAction();
                };

                $controller('BaseZnkExerciseController', {
                    $scope: $scope,
                    exerciseData: exerciseData,
                    exerciseSettings: exerciseSettings
                });


                this.headerTitle = exerciseData.headerTitle;

                // this.showTimer = (isExerciseComplete) ? false : (isPractice || isSection);

                this.isComplete = isExerciseComplete;
                // tutorial intro
                // if (exerciseData.exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum) {
                //     if (angular.isArray(exerciseData.exercise.content)) {
                //         angular.forEach(exerciseData.exercise.content, function (content) {
                //             content.title = content.title.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                //             content.body = content.body.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                //         });
                //     }
                //
                //     this.subjectId = exerciseData.exercise.subjectId;
                //     this.tutorialContent = exerciseData.exercise.content;
                //     var videoSrc = ENV.videosEndPoint + 'videos/tutorials/' + exerciseData.exercise.id + '.mp4';
                //     this.videoSrc = $sce.trustAsResourceUrl(videoSrc);
                //     this.iconName = 'book-icon';
                //     this.iconClickHandler = function () {
                //         vm.showIntro = true;
                //     };
                //
                //     this.goToQuestions = function () {
                //         vm.showIntro = false;
                //     };
                //
                //     this.trustAsHtml = function (html) {
                //         return $sce.trustAsHtml(html);
                //     };
                // }
            }]
        );
})(angular);

angular.module('znk.infra-web-app.znkExerciseStatesUtility').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkExerciseStatesUtility/templates/exercise.template.html",
    "<div class=\"exercise-container base-border-radius\">\n" +
    "    <znk-exercise-header subject-id=\"baseZnkExerciseCtrl.exercise.subjectId\"\n" +
    "                         options=\"{\n" +
    "                            showQuit: true,\n" +
    "                            showNumSlide: true,\n" +
    "                            showDate: vm.showTimer,\n" +
    "                            reviewMode: vm.isComplete\n" +
    "                         }\"\n" +
    "                         total-slide-num=\"{{baseZnkExerciseCtrl.numberOfQuestions}}\"\n" +
    "                         ng-model=\"baseZnkExerciseCtrl.currentIndex\"\n" +
    "                         side-text=\"{{vm.headerTitle}}\"\n" +
    "                         timer-data=\"baseZnkExerciseCtrl.timerData\"\n" +
    "                         on-clicked-quit=\"vm.onHeaderQuit()\"\n" +
    "                         icon-name=\"{{vm.iconName}}\"\n" +
    "                         icon-click-handler=\"vm.iconClickHandler()\">\n" +
    "    </znk-exercise-header>\n" +
    "<!--    <znk-progress-linear-exercise ng-if=\"vm.showTimer\"\n" +
    "                                  start-time=\"baseZnkExerciseCtrl.startTime\"\n" +
    "                                  max-time=\"baseZnkExerciseCtrl.maxTime\"\n" +
    "                                  on-finish-time=\"baseZnkExerciseCtrl.onFinishTime()\"\n" +
    "                                  on-change-time=\"baseZnkExerciseCtrl.onChangeTime(passedTime)\">\n" +
    "    </znk-progress-linear-exercise>-->\n" +
    "    <znk-exercise questions=\"baseZnkExerciseCtrl.exercise.questions\"\n" +
    "                  ng-model=\"baseZnkExerciseCtrl.resultsData.questionResults\"\n" +
    "                  settings=\"baseZnkExerciseCtrl.settings\"\n" +
    "                  actions=\"baseZnkExerciseCtrl.actions\">\n" +
    "    </znk-exercise>\n" +
    "    <!--<div ng-if=\"vm.showIntro\" class=\"workout-roadmap-tutorial-intro\"-->\n" +
    "         <!--ng-include-->\n" +
    "         <!--src=\"'app/tutorials/templates/tutorialIntro.template.html'\">-->\n" +
    "    <!--</div>-->\n" +
    "</div>\n" +
    "");
}]);
