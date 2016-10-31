/**
 * evaluateQuestionResult
 *   questionResultGetter - get question result
 *   exerciseTypeGetter - exercise type
 *   evaluatorDataGetter - evaluator data (optional)
 *   like: {
 *        questionResultGetter: {
 *           index: 1,
 *           userAnswer: 'text'
 *        },
 *        evaluatorDataGetter: {
 *           score: 2.5
 *        },
 *        exerciseTypeGetter: 2
 *   }
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').component('evaluateQuestionResult', {
            bindings: {
                questionResultGetter: '&questionResult',
                exerciseTypeGetter: '&exerciseType',
                evaluatorDataGetter: '&?evaluatorData'
            },
            templateUrl: 'components/evaluator/templates/evaluateQuestionResult.template.html',
            controllerAs: 'vm',
            controller: function (ZnkEvaluateResultSrv) {
                'ngInject';

                var vm = this;

                var questionResult = vm.questionResultGetter();
                var exerciseType = vm.exerciseTypeGetter();
                var evaluatorData = vm.evaluatorDataGetter ? vm.evaluatorDataGetter() : {};

                var evaluateQuestionResultStates = {
                    completed: 1,
                    skipped: 2,
                    evaluated: 3
                };

                vm.evaluateQuestionResultStates = evaluateQuestionResultStates;
                vm.index = questionResult.index;

                vm.type = exerciseType;

                ZnkEvaluateResultSrv.getEvaluateTypes().then(function (types) {
                    vm.aliasName = types[exerciseType].aliasName;
                });

                // set state of component
                if (evaluatorData.score) {
                    vm.activeState = evaluateQuestionResultStates.evaluated;
                    vm.points = evaluatorData.score;
                } else if (questionResult.userAnswer && questionResult.userAnswer !== true) {
                    vm.activeState = evaluateQuestionResultStates.completed;
                } else {
                    vm.activeState = evaluateQuestionResultStates.skipped;
                }
            }
        }
    );
})(angular);
