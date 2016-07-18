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
                return function(question) {
                   return question.manualEvaluation &&
                       question.__questionStatus.userAnswer &&
                       question.__questionStatus.userAnswer !== true;
                };
            });

            ZnkEvaluatorSrvProvider.getEvaluateStatusFnGetter(function (EvaluatorStatesEnum, purchaseService) {
                'ngInject';
                return function(evaluatorData) {
                    return purchaseService.hasProVersion().then(function(isPro) {
                        if (!isPro) {
                            return EvaluatorStatesEnum.NOT_PURCHASE.enum;
                        } else if (evaluatorData.points) {
                            return EvaluatorStatesEnum.EVALUATED.enum;
                        } else if (!evaluatorData.userAnswer) {
                            return EvaluatorStatesEnum.HIDE.enum;
                        } else {
                            return EvaluatorStatesEnum.PENDING.enum;
                        }
                    });
                };
            });
        }
    ]);

})(angular);
