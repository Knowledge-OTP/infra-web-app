(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntroTutorial', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntroTutorial/completeExerciseIntroTutorialDirective.template.html',
            require: {
                completeExerciseIntroCtrl: '^completeExerciseIntro'
            },
            controller: function (ENV, ExerciseTypeEnum, $sce) {
                'ngInject';

                this.$onInit = function () {
                    var exerciseContent = this.completeExerciseIntroCtrl.getExerciseContent();

                    this.exerciseContent = exerciseContent;

                    this.videoSrc = $sce.trustAsResourceUrl(ENV.videosEndPoint + 'videos/' + 'tutorials' + '/' + exerciseContent.id + '.mp4');

                    this.trustAsHtml = function (html) {
                        return $sce.trustAsHtml(html);
                    };

                    this.showBtn = this.exerciseContent ? this.exerciseContent.questions.length > 0 : false;

                    this.goToQuestions = function(){
                        this.completeExerciseIntroCtrl.goToQuestions();
                    };
                };
            }
        });
})(angular);
