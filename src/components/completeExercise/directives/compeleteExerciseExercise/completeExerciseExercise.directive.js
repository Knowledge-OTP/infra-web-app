// (function (angular) {
//     'use strict';
//
//     angular.module('znk.infra-web-app.completeExercise')
//         .component('completeExerciseExercise', {
//             restrict: 'E',
//             templateUrl: 'app/workouts/templates/workoutsWorkoutExercise.template.html',
//             bindings: {
//                 exerciseData: '<',
//                 screenSharingData: '<'
//             },
//             controller: function ($controller, $scope, $filter, ScreenSharingSrv) {
//                 'ngInject';
//
//                 var _invokeIntroCtrl = () => {
//                     this.exerciseData.headerTitlePrefix = '';
//
//                     this.exerciseData.headerExitAction = () => {
//                         if (this.screenSharingData) {
//                             ScreenSharingSrv.endSharing(this.screenSharingData.guid);
//                         }
//                     };
//
//                     $scope.vm = $controller('WorkoutsWorkoutExerciseController', {
//                         exerciseData: this.exerciseData,
//                         $scope: $scope
//                     });
//                 };
//
//                 _invokeIntroCtrl();
//             }
//         });
// })(angular);
