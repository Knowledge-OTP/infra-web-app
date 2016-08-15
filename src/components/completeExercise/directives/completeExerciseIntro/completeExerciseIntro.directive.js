// (function (angular) {
//     'use strict';
//
//     angular.module('completeExerciseIntro', {
//         restrict: 'E',
//         templateUrl: 'app/components/completeExercise/directives/completeExerciseIntroSummaryDirective.template.html',
//         bindings: {
//             exerciseData: '<',
//             screenSharingData: '<'
//         },
//         controller: function ($controller, $scope, $filter, ScreenSharingSrv) {
//             'ngInject';
//
//             var _invokeIntroCtrl = () => {
//                 this.exerciseData.headerTitlePrefix = '';
//
//                 this.exerciseData.headerExitAction = () => {
//                     if (this.screenSharingData) {
//                         ScreenSharingSrv.endSharing(this.screenSharingData.guid);
//                     }
//                 };
//                 this.exerciseData.goToQuestionsHandler = () => {
//                     ScreenSharingSrv.getActiveScreenSharingData().then((activeScreenSharingData) => {
//                         if (activeScreenSharingData && activeScreenSharingData.activeExercise) {
//                             activeScreenSharingData.activeExercise.activeScreen = 'EXERCISE';
//                             activeScreenSharingData.$save();
//                         }
//                     });
//                 };
//                 $scope.vm = $controller('tutorialIntroController', {
//                     exerciseData: this.exerciseData
//                 });
//             };
//
//             _invokeIntroCtrl();
//
//             this.viewTemplateUrl = 'app/tutorials/templates/tutorialIntro.template.html';
//         }
//     });
// })(angular);
