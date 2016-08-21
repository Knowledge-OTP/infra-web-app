(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseExercise/completeExerciseExerciseDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: function ($controller, CompleteExerciseSrv, $q, $translate, PopUpSrv) {
                'ngInject';

                var $ctrl = this;

                function _initTimersVitalData(){
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();

                    if(angular.isUndefined(exerciseResult.duration)){
                        exerciseResult.duration = 0;
                    }

                    $ctrl.timerConfig = {
                        countDown: true,
                        max: exerciseContent.time
                    };
                }

                function _invokeExerciseCtrl(){
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();

                    var settings = {
                        exerciseContent: exerciseContent,
                        exerciseResult: exerciseResult,
                        actions:{
                            done: function(){
                                $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.SUMMARY);
                            }
                        }
                    };

                    $ctrl.znkExercise = $controller('CompleteExerciseBaseZnkExerciseCtrl',{
                        settings: settings
                    });
                }

                this.$onInit = function () {
                    _initTimersVitalData();

                    _invokeExerciseCtrl();

                    this.durationChanged = function(){
                        var exerciseResult = this.completeExerciseCtrl.getExerciseResult();
                        var exerciseContent = this.completeExerciseCtrl.getExerciseContent();

                        if(exerciseResult.duration >= exerciseContent.time){
                            var contentProm = $translate('COMPLETE_EXERCISE.TIME_UP_CONTENT');
                            var titleProm = $translate('COMPLETE_EXERCISE.TIME_UP_TITLE');
                            var buttonFinishProm = $translate('COMPLETE_EXERCISE.STOP');
                            var buttonContinueProm = $translate('COMPLETE_EXERCISE.CONTINUE_BTN');

                            $q.all([contentProm, titleProm, buttonFinishProm, buttonContinueProm]).then(function (results) {
                                var content = results[0];
                                var title = results[1];
                                var buttonFinish = results[2];
                                var buttonContinue = results[3];
                                var timeOverPopupPromise = PopUpSrv.ErrorConfirmation(title, content, buttonFinish, buttonContinue).promise;

                                timeOverPopupPromise.then(function () {
                                    $ctrl.znkExercise._finishExercise();
                                    // _finishExercise(exerciseResult);
                                });
                            });
                        }
                    };
                };
            }
        });
})(angular);
