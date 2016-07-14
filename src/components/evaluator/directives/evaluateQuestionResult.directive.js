/**
 * evaluateQuestionResult
 *   questionResultGetter - get question result
 *   evaluatorDataGetter
 *   like: {
 *        questionResultGetter: {
 *           index: 1,
 *           userAnswer: 'text'
 *        },
 *        evaluatorDataGetter: {
 *           score: 2.5,
 *           exerciseType: 2
 *        }
 *   }
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').component('evaluateQuestionResult', {
            bindings: {
                questionResultGetter: '&questionResult',
                evaluatorDataGetter: '&evaluatorData'
            },
            templateUrl: 'components/evaluator/templates/evaluateQuestionResult.template.html',
            controllerAs: 'vm',
            controller: function ($translatePartialLoader, ZnkEvaluateResultSrv) {
                'ngInject';

                $translatePartialLoader.addPart('evaluator');

                var vm = this;

                var questionResult = vm.questionResultGetter();
                var evaluatorData = vm.evaluatorDataGetter();

                var evaluateQuestionResultStates = {
                    completed: 1,
                    skipped: 2,
                    evaluated: 3
                };

                vm.evaluateQuestionResultStates = evaluateQuestionResultStates;
                vm.index = questionResult.index;

                vm.type = evaluatorData.exerciseType;

                ZnkEvaluateResultSrv.getEvaluateTypes().then(function (types) {
                    vm.aliasName = types[vm.type].aliasName;
                });

                // set state of component
                if (evaluatorData.score) {
                    vm.activeState = evaluateQuestionResultStates.evaluated;
                    vm.points = evaluatorData.score;
                } else if (questionResult.userAnswer
                    && questionResult.userAnswer !== true) {
                    vm.activeState = evaluateQuestionResultStates.completed;
                } else {
                    vm.activeState = evaluateQuestionResultStates.skipped;
                }
            }
        }
    );
})(angular);
