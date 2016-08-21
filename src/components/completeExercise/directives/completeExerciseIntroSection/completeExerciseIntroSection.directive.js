(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntroSection', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntroSection/completeExerciseIntroSectionDirective.template.html',
            require: {
                completeExerciseIntroCtrl: '^completeExerciseIntro'
            },
            controller: function ($filter) {
                'ngInject';

                this.$onInit = function(){
                    var exerciseParentContent = this.completeExerciseIntroCtrl.getExerciseParentContent();
                    var exerciseContent = this.completeExerciseIntroCtrl.getExerciseContent();

                    this.exerciseContent = exerciseContent;
                    this.exerciseParentContent = exerciseParentContent;

                    var timeDurationFilter = $filter('formatTimeDuration');
                    this.timeTranslateValue = {
                        min: timeDurationFilter(exerciseContent .time, 'mm'),
                        sec: timeDurationFilter(exerciseContent .time, 'rss')
                    };

                    this.start = function(){
                        this.completeExerciseIntroCtrl.goToQuestions();
                    };
                };
            }
        });
})(angular);
