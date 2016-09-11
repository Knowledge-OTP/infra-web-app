(function (angular) {
    angular.module('demo', [
        'znk.infra-web-app.completeExercise',
        'znk.infra-web-app.webAppScreenSharing',
        'demoEnv'
    ])
        .run(function ($rootScope, BaseExerciseGetterSrv, ExerciseTypeEnum, ExerciseParentEnum, ScreenSharingSrv) {
            $rootScope.data = {};

            $rootScope.exerciseTypeEnumArr = ExerciseTypeEnum.getEnumArr();
            $rootScope.data.exerciseType = ExerciseTypeEnum.TUTORIAL;

            $rootScope.exerciseParentEnumArr = ExerciseParentEnum.getEnumArr();
            $rootScope.data.exerciseParent = ExerciseParentEnum.TUTORIAL;

            $rootScope.settings = {
                exitAction: function () {
                    alert('exit');
                }
            };

            $rootScope.uidToShareScreenWith = '7fdcdac0-ea4a-4295-9cd6-374cfed5944b';

            $rootScope.shareMyScreen = function (uid) {
                ScreenSharingSrv.shareMyScreen({
                    uid: uid,
                    isTeacher: false
                });
            };

            $rootScope.viewOtherUserScreen = function (uid) {
                ScreenSharingSrv.viewOtherUserScreen({
                    uid: uid,
                    isTeacher: false
                });
            };

            $rootScope.$watch('data', function (data) {
                if (!data) {
                    return;
                }

                var exerciseId;
                var parentId;

                switch (data.exerciseType.enum) {
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

                switch (data.exerciseParent.enum) {
                    case ExerciseParentEnum.WORKOUT.enum:
                        parentId = 10;
                        break;
                    case ExerciseParentEnum.EXAM.enum:
                        parentId = 17;
                        break;
                    case ExerciseParentEnum.MODULE.enum:
                        parentId = 6;
                        break;
                }

                $rootScope.exerciseData = {
                    exerciseTypeId: data.exerciseType.enum,
                    exerciseParentTypeId: data.exerciseParent.enum,
                    exerciseId: exerciseId,
                    exerciseParentId: parentId
                };
            }, true);
        })
        .run(function ($timeout, $translatePartialLoader) {
            $timeout(function () {
                $translatePartialLoader.addPart('completeExerciseDemoLocale');
            });
        })
        .component('completeExerciseSummary',{
            template: '<div>Summary</div>'
        });
})(angular);
