
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary').component('znkSummaryResults', {
        templateUrl: 'components/znkSummary/templates/znkSummaryResults.template.html',
        bindings: {
            exerciseResult: '<',
            questionsLength: '<'
        },
        controller: function($translatePartialLoader) {
            'ngInject';
            $translatePartialLoader.addPart('znkSummary');

            var PERCENTAGE = 100;

            var vm = this;

            vm.avgTime = {
                correctAvgTime: Math.round(vm.exerciseResult.correctAvgTime / 1000),
                wrongAvgTime: Math.round(vm.exerciseResult.wrongAvgTime / 1000),
                skippedAvgTime: Math.round(vm.exerciseResult.skippedAvgTime / 1000)
            };

            vm.gaugeSuccessRate = vm.questionsLength > 0 ? Math.round((vm.exerciseResult.correctAnswersNum * PERCENTAGE) / vm.questionsLength) : 0;

            vm.performenceChart = {
                labels: ['Correct', 'Wrong', 'Unanswered'],
                data: [vm.exerciseResult.correctAnswersNum, vm.exerciseResult.wrongAnswersNum, vm.exerciseResult.skippedAnswersNum],
                colours: ['#87ca4d', '#ff6766', '#ebebeb'],
                options: {
                    segmentShowStroke: false,
                    percentageInnerCutout: 85,
                    showTooltips: false,
                    animation: false
                }
            };
        },
        controllerAs: 'vm'
    });
})(angular);

