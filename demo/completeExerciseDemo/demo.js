(function(angular){
    angular.module('demo', [
        'znk.infra-web-app.completeExercise',
    ]).run(function($rootScope, BaseExerciseGetterSrv, ExerciseTypeEnum, ExerciseParentEnum){
        $rootScope.data = {};

        $rootScope.exerciseTypeEnumArr = ExerciseTypeEnum.getEnumArr();
        $rootScope.data.exerciseType = ExerciseTypeEnum.TUTORIAL;

        $rootScope.exerciseParentEnumArr = ExerciseParentEnum.getEnumArr();
        $rootScope.data.exerciseParent = ExerciseParentEnum.TUTORIAL;

        $rootScope.settings = {
            exitAction: function(){
                alert('exit');
            }
        };
        $rootScope.$watch('data',function(data){
            if(!data){
                return;
            }

            var exerciseId;
            var parentId;

            switch (data.exerciseType.enum){
                case ExerciseTypeEnum.TUTORIAL.enum:
                    exerciseId = 100;
                    break;
                case ExerciseTypeEnum.PRACTICE.enum:
                    exerciseId = 240;
                    break;
                case ExerciseTypeEnum.GAME.enum:
                    alert('no game exercise available');
                    return;
                case ExerciseTypeEnum.SECTION.enum:
                    exerciseId = 1162;
                    break;
                case ExerciseTypeEnum.DRILL.enum:
                    alert('no drill exercise available');
                    return;
                case ExerciseTypeEnum.LECTURE.enum:
                    exerciseId = 12;
                    break;
            }

            switch (data.exerciseParent.enum){
                case ExerciseParentEnum.WORKOUT.enum:
                    parentId = 10;
                    break;
                case ExerciseParentEnum.EXAM.enum:
                    parentId = 17;
                    break;
                case ExerciseParentEnum.MODULE.enum:
                    parentId = 100;
                    break;
            }

            $rootScope.exerciseData = {
                exerciseTypeId: data.exerciseType.enum,
                exerciseParentTypeId: data.exerciseParent.enum,
                exerciseId: exerciseId,
                exerciseParentId: parentId
            };
        },true);
    });
})(angular);
