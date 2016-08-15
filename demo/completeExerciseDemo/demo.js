(function(angular){
    angular.module('demo', [
        'znk.infra-web-app.completeExercise',
        // 'znk.infra.content',
        // 'znk.infra.config',
        // 'znk.infra.storage',
        // 'znk.infra.contentGetters'
    ]).run(function($rootScope, BaseExerciseGetterSrv, ExerciseTypeEnum, ExerciseParentEnum){
        $rootScope.data = {};

        $rootScope.exerciseTypeEnumArr = ExerciseTypeEnum.getEnumArr();
        $rootScope.data.exerciseType = ExerciseTypeEnum.TUTORIAL;

        $rootScope.exerciseParentEnumArr = ExerciseParentEnum.getEnumArr();
        $rootScope.data.exerciseParent = ExerciseParentEnum.WORKOUT;

        $rootScope.$watch('data',function(data){
            if(!data){
                return;
            }

            var exerciseId;
            var parentId;

            switch ($rootScope.data.exerciseType.enum){
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
                    exerciseId = 1137;
                    break;
                case ExerciseTypeEnum.DRILL.enum:
                    alert('no drill exercise available');
                    return;
                case ExerciseTypeEnum.LECTURE.enum:
                    exerciseId = 12;
                    break;
            }

            $rootScope.exerciseData = {
                exerciseTypeId: data.exerciseType.enum,
                exerciseParentId: data.exerciseParent.enum,
                exerciseId: exerciseId,
                parentId: parentId
            };
        },true);
    });
})(angular);
