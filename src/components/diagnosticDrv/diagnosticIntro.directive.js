'use strict';

angular.module('znk.infra-web-app.diagnosticDrv').directive('diagnosticIntro', ['TestScoreCategoryEnum', 'WorkoutsDiagnosticFlow', '$translatePartialLoader',
    function DiagnosticIntroDirective(TestScoreCategoryEnum, WorkoutsDiagnosticFlow, $translatePartialLoader) {

    var directive = {
        restrict: 'E',
        scope: {
            showInstructions: '=?'
        },
        templateUrl: 'components/diagnosticDrv/diagnosticIntro.template.html',
        link: function link(scope) {

            $translatePartialLoader.addPart('diagnosticDrv');

            var testScoreCategoryIndexMap = {
                math: 1,
                writing: 2,
                reading: 3
            };

            var testScoreIdToIndexMap = {};

            testScoreIdToIndexMap[TestScoreCategoryEnum.MATH.enum] = {
                id: 1,
                className: 'diagnostic-raccoon-math'
            };
            testScoreIdToIndexMap[TestScoreCategoryEnum.READING.enum] = {
                id: 2,
                className: 'diagnostic-raccoon-reading'
            };
            testScoreIdToIndexMap[TestScoreCategoryEnum.WRITING.enum] = {
                id: 3,
                className: 'diagnostic-raccoon-writing'
            };
            testScoreIdToIndexMap.all = {
                id: Infinity,
                className: 'diagnostic-raccoon'
            };
            testScoreIdToIndexMap.none = {
                id: -1,
                className: 'diagnostic-raccoon'
            };

            scope.d = {
                testScoreCategoryIndexMap: testScoreCategoryIndexMap
            };

            WorkoutsDiagnosticFlow.getActiveSectionData().then(function (activeTestScoreData) {
                var activeTestScoreId = activeTestScoreData.id;
                scope.d.noCalc = activeTestScoreData.noCalc;

                scope.d.currTestScoreCategoryIndex = testScoreIdToIndexMap[activeTestScoreId].id;

                scope.d.raccoonClassName = testScoreIdToIndexMap[activeTestScoreId].className;

                if (activeTestScoreId === TestScoreCategoryEnum.MATH.enum && activeTestScoreData.noCalc) {
                    scope.d.raccoonClassName = testScoreIdToIndexMap[activeTestScoreId].className + '-no-calc';
                }
            });
        }
    };

    return directive;
}]);
