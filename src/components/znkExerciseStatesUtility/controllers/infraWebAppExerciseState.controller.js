(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkExerciseStatesUtility')
        .controller('InfraWebAppExerciseStateCtrl',
            function ($controller, $scope, exerciseData, $filter, ExerciseTypeEnum, $sce, ENV, SubjectEnum) {
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
            }
        );
})(angular);
