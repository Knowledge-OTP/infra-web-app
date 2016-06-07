(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutInProgressController',
        function (data, ExerciseResultSrv) {
            'ngInject';

            var vm = this;

            vm.workout = data.exercise;

            ExerciseResultSrv.getExerciseResult(vm.workout.exerciseTypeId, vm.workout.exerciseId, null, null, true).then(function(exerciseResult){
                vm.exerciseResult = exerciseResult;
                exerciseResult.totalQuestionNum = exerciseResult.totalQuestionNum || 0;
                exerciseResult.totalAnsweredNum = exerciseResult.totalAnsweredNum || 0;
            });
            // var self = this;
            // var subjectId = data.exercise.subjectId;
            //
            // var subjectName = SubjectEnum.getValByEnum(subjectId);
            //
            // var isMath = subjectId === SubjectEnum.MATH.enum;
            // var subjectIcon = subjectName + '-';
            // subjectIcon += isMath ? 'section-icon' : 'icon';
            //
            // this.workoutIntroData = {
            //     subjectId: subjectId,
            //     subjectName: SubjectService.translateSubjectName(subjectId),
            //     subjectIcon: subjectIcon,
            //     status: data.exercise.status,
            //     workoutOrder: data.exercise.workoutOrder,
            //     answeredCount: 0,
            //     exerciseResult: data.exerciseResult
            // };
            //
            // this.workoutIntroData.exerciseResult.questionResults.forEach(function (questionResult) {
            //     self.workoutIntroData.answeredCount += angular.isDefined(questionResult.userAnswer) ? 1 : 0;
            // });
            //
            // CategoryService.getCategoryData(data.exercise.categoryId).then(function (category) {
            //     self.workoutIntroData.categoryName = category ? category.name : '';
            // });
            //
            // WorkoutsSrv.getWorkoutData(data.exercise.workoutOrder).then(function (workoutData) {
            //     workoutData.exerciseProm.then(function (exercise) {
            //         self.workoutIntroData.questionsCount = exercise.questions.length;
            //     });
            // });
        }
    );
})();
