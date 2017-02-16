(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntroSection', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntroSection/completeExerciseIntroSectionDirective.template.html',
            require: {
                completeExerciseIntroCtrl: '^completeExerciseIntro'
            },
            controller: function ($filter, CategoryService) {
                'ngInject';

                this.$onInit = function(){
                    var exerciseParentContent = this.completeExerciseIntroCtrl.getExerciseParentContent();
                    var exerciseContent = this.completeExerciseIntroCtrl.getExerciseContent();
                    var categoryIdForSubjectId = exerciseContent.catgoryId || exerciseContent.catgoryId2;
                    
                    this.exerciseSubjectId = CategoryService.getCategoryLevel1ParentByIdSync(categoryIdForSubjectId);

                    this.exerciseContent = exerciseContent;
                    this.exerciseParentContent = exerciseParentContent;

                    var translateFilter = $filter('translate');
                    this.subjectNameTranslateKey = translateFilter('COMPLETE_EXERCISE.SUBJECTS.' + this.exerciseSubjectId);
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
