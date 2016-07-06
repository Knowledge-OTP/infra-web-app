angular.module('demo', [
    'znk.infra-web-app.tests'
])
    .config(function ($translateProvider, SvgIconSrvProvider, $stateProvider) {

        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'

        })
            .preferredLanguage('en');

        $stateProvider.state('app', {
            // resolve: {
            //     testsData: function (ExamSrv, ExerciseResultSrv, $q) {
            //         return ExamSrv.getAllExams(true).then(function (exams) {
            //             var examResultsProms = [];
            //             angular.forEach(exams, function (exam) {
            //                 examResultsProms.push(ExerciseResultSrv.getExamResult(exam.id, true));
            //             });
            //             return $q.all(examResultsProms).then(function (examsResults) {
            //                 return {
            //                     exams: exams,
            //                     examsResults: examsResults
            //                 };
            //             });
            //         });
            //     },
            //     diagnosticData: function (DiagnosticSrv) {
            //         return DiagnosticSrv.getDiagnosticStatus().then(function (result) {
            //             var isDiagnosticsComplete = result === 2;
            //             return (isDiagnosticsComplete) ? isDiagnosticsComplete : false;
            //         });
            //     }
            // },
            // controller: 'DemoController',
            // controllerAs: 'vm'
        });


        var svgMap = {};
        SvgIconSrvProvider.registerSvgSources(svgMap);
    })
    .config(function (EstimatedScoreSrvProvider, EstimatedScoreEventsHandlerSrvProvider, exerciseTypeConst) {
        var shouldEventBeProcessed;
        var subjectsRawScoreEdges = {
            0: {
                min: 0,
                max: 60
            },
            5: {
                min: 0,
                max: 85
            }
        };
        EstimatedScoreSrvProvider.setSubjectsRawScoreEdges(subjectsRawScoreEdges);

        EstimatedScoreSrvProvider.setRawScoreToRealScoreFn(function () {
            return function (subjectId, rawScore) {
                return rawScore * 3;
            };
        });

        var MIN_DIAGNOSTIC_SCORE = 0;
        var MAX_DIAGNOSTIC_SCORE = 1500;
        EstimatedScoreSrvProvider.setMinMaxDiagnosticScore(MIN_DIAGNOSTIC_SCORE, MAX_DIAGNOSTIC_SCORE);

        var diagnosticScoringMap = {
            1: [90, 90, 50, 50],
            2: [100, 100, 60, 60],
            3: [120, 120, 80, 80],
            4: [140, 140, 100, 100],
            5: [150, 150, 120, 120]
        };
        EstimatedScoreEventsHandlerSrvProvider.setDiagnosticScoring(diagnosticScoringMap);

        var sectionRawPoints = [1, 0, -0.25, 0];
        EstimatedScoreEventsHandlerSrvProvider.setExerciseRawPoints(exerciseTypeConst.SECTION, sectionRawPoints);

        var drillRawPoints = [0.2, 0, 0, 0];
        EstimatedScoreEventsHandlerSrvProvider.setExerciseRawPoints(exerciseTypeConst.DRILL, drillRawPoints);

        EstimatedScoreEventsHandlerSrvProvider.setEventProcessControl(function () {
            return function () {
                return angular.isDefined(shouldEventBeProcessed) ? shouldEventBeProcessed.apply(this, arguments) : true;
            };
        });
    })
    .config(function (ScoringServiceProvider) {
        ScoringServiceProvider.setScoringLimits({
            exam: {
                min: 400,
                max: 1600
            },
            subjects: {
                min: 200,
                max: 800
            }
        });

        ScoringServiceProvider.setExamScoreFnGetter(function () {
            return function (scoresArr) {
                var totalScores = 0;
                angular.forEach(scoresArr, function (score) {
                    totalScores += score;
                });
                return totalScores;
            }
        });
    })
    .run(function ($rootScope, $translate, $state, $translatePartialLoader) {

        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });

        $rootScope.openTests = function () {
            $state.go('app');
            $rootScope.waitForProm = true;
        };

        $translatePartialLoader.addPart('demo');
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error.message);
        });
    });
