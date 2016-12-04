/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').config(
        function ($provide) {
            'ngInject';

            $provide.decorator('questionBuilderDirective',
                function ($delegate, ZnkExerciseUtilitySrv) {
                    'ngInject';// jshint ignore:line

                    var directive = $delegate[0];

                    directive.link.pre = function(scope, element, attrs, ctrls){
                        var questionBuilderCtrl = ctrls[0];
                        var znkExerciseCtrl = ctrls[1];

                        var functionsToBind = ['getViewMode','addQuestionChangeResolver','removeQuestionChangeResolver', 'getCurrentIndex'];
                        ZnkExerciseUtilitySrv.bindFunctions(questionBuilderCtrl, znkExerciseCtrl,functionsToBind);

                        questionBuilderCtrl.bindExerciseEventManager = znkExerciseCtrl.bindExerciseEventManager;

                        questionBuilderCtrl.updateAnswerExplnView = function(isAnswerExplanationOpen){
                            if(isAnswerExplanationOpen){
                                element.addClass('answer-explanation-open');
                            } else {
                                element.removeClass('answer-explanation-open');
                            }
                        };

                        element.append('<answer-explanation></answer-explanation>');
                    };

                    return $delegate;
                }
            );
        }
    );
})(angular);

