(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').config([
        'ZnkEvaluatorSrvProvider',
        function (ZnkEvaluatorSrvProvider) {

            ZnkEvaluatorSrvProvider.shouldEvaluateQuestionFnGetter(function (purchaseService) {
                'ngInject';
                return function(question) {
                    return purchaseService.hasProVersion().then(function(isPro) {
                        return isPro &&
                            question.manualEvaluation &&
                            question.__questionStatus.userAnswer &&
                            question.__questionStatus.userAnswer !== true;
                    });
                };
            });

            ZnkEvaluatorSrvProvider.isEvaluateQuestionTypeFnGetter(function () {
                'ngInject';
                return function(question, skipCheckingUserAnswer) {
                   return question.manualEvaluation && (
                           skipCheckingUserAnswer ? true : question.__questionStatus.userAnswer &&
                           question.__questionStatus.userAnswer !== true
                       );
                };
            });

            ZnkEvaluatorSrvProvider.isEvaluateExerciseTypeFnGetter(function (ZnkEvaluatorSrv) {
                'ngInject';
                var evaluateQuestionTypeFn = ZnkEvaluatorSrv.isEvaluateQuestionTypeFn();
                return function(questions) {
                    var isExerciseEvaluateType = false;
                    // if even one question is evaluation type then return true
                    for (var i = 0, ii = questions.length; i < ii; i++) {
                        if (evaluateQuestionTypeFn(questions[i], true)) {
                            isExerciseEvaluateType = true;
                            break;
                        }
                    }
                    return isExerciseEvaluateType;
                };
            });

            ZnkEvaluatorSrvProvider.getEvaluateStatusFnGetter(function (EvaluatorStatesEnum, purchaseService) {
                'ngInject';
                return function(evaluatorData) {
                    return purchaseService.hasProVersion().then(function(isPro) {
                        if (!isPro) {
                            return EvaluatorStatesEnum.NOT_PURCHASE.enum;
                        } else if (evaluatorData && evaluatorData.points) {
                            return EvaluatorStatesEnum.EVALUATED.enum;
                        } else {
                            return EvaluatorStatesEnum.PENDING.enum;
                        }
                    });
                };
            });
        }
    ]);

})(angular);
