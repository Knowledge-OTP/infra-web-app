(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntroSection', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntroSection/completeExerciseIntroSection.template.html',
            require: {
                completeExerciseIntroCtrl: '^completeExerciseIntro'
            },
            controller: function ($filter, CategoryService) {
                'ngInject';

                this.$onInit = function(){
                    var exerciseParentContent = this.completeExerciseIntroCtrl.getExerciseParentContent();
                    var exerciseContent = this.completeExerciseIntroCtrl.getExerciseContent();

                    this.exerciseSubjectId = (typeof exerciseContent.subjectId === 'undefined' || exerciseContent.subjectId === null) ?
                        CategoryService.getCategoryLevel1ParentSync([exerciseContent.categoryId, exerciseContent.categoryId2]) : exerciseContent.subjectId;

                    this.exerciseContent = exerciseContent;
                    this.exerciseParentContent = exerciseParentContent;

                    var translateFilter = $filter('translate');
                    this.subjectNameTranslateKey = translateFilter('SUBJECTS.' + this.exerciseSubjectId);
                    this.instructionsTranslateKey = translateFilter('COMPLETE_EXERCISE.SECTION_INSTRUCTION.' + this.exerciseSubjectId);

                    var timeDurationFilter = $filter('formatTimeDuration');
                    this.timeTranslateValue = {
                        min: timeDurationFilter(exerciseContent.time, 'mm'),
                        sec: timeDurationFilter(exerciseContent.time, 'rss')
                    };

                    this.start = function(){
                        this.completeExerciseIntroCtrl.goToQuestions();
                    };
                };
            }
        });
})(angular);
