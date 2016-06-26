(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').controller('TestsSectionIntroController',
        function (exerciseData, $state, ExamTypeEnum, SubjectEnum, $stateParams, znkAnalyticsSrv, TestScoreCategoryEnum, $filter, $translatePartialLoader) {
            'ngInject';


            $translatePartialLoader.addPart('tests');
            var self = this;
            var typeFull = (exerciseData.examData.typeId === ExamTypeEnum['FULL TEST'].enum);
            var translateFilter = $filter('translate');

            this.sideTextByExamType = typeFull ? '.FULL_TEST_TEXT' : '.MINI_TEST_TEXT';
            this.exerciseNum = exerciseData.examData.name.match(/\d+/)[0];
            this.subjectId = exerciseData.exercise.subjectId;
            this.subjectEnum = SubjectEnum;
            this.questionCount = exerciseData.exercise.questionCount;
            this.time = exerciseData.exercise.time;
            this.isCalc = exerciseData.exercise.calculator;
            this.categoryId = exerciseData.exercise.categoryId;
            this.categoryName = exerciseData.exercise.categoryId;
            this.TestScoreCategoryEnum = TestScoreCategoryEnum;

            var translateSuffix;
            translateSuffix = TestScoreCategoryEnum.getValByEnum(this.categoryId);
            translateSuffix = angular.uppercase(translateSuffix);
            if (this.categoryId === TestScoreCategoryEnum.MATH.enum) {
                translateSuffix += this.isCalc ? '_CALCULATOR' : '_NO_CALCULATOR';
            }
            this.testScoreIntroName = translateFilter('TEST_SECTION_INTRO.' + translateSuffix);
            this.testScoreInstructions = translateFilter('TEST_SECTION_INTRO.INSTRUCTIONS_' + translateSuffix);

            this.onClickedQuit = function () {
                $state.go('app.tests.roadmap', {exam: $stateParams.examId});
            };

            this.goToExercise = function () {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'sectionStarted',
                    props: {
                        testType: typeFull ? 'full' : 'mini',
                        subjectType: self.subjectId,
                        examId: exerciseData.examData.id,
                        sectionId: exerciseData.exercise.id,
                        testName: exerciseData.examData.name
                    }
                });
                znkAnalyticsSrv.timeTrack({eventName: 'sectionCompleted'});
                exerciseData.exerciseResult.seenIntro = true;
                exerciseData.exerciseResult.$save();
                $state.go('^.exercise');
            };
        }
    );
})(angular);
