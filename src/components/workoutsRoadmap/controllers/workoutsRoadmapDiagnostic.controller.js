"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticController',
        function ($state, ExerciseStatusEnum, data, $timeout) {
            'ngInject';
            //  fixing page not rendered in the first app entrance issue
            $timeout(function () {
                switch (data.diagnostic.status) {
                    case ExerciseStatusEnum.COMPLETED.enum:
                        var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
                        if (isFirstWorkoutStarted) {
                            $state.go('.summary');
                        } else {
                            $state.go('.preSummary');
                        }
                        break;
                    default:
                        $state.go('.intro');
                }
            });
        });
})();

// export class WorkoutsRoadMapDiagnosticController {
//     constructor($state, ExerciseStatusEnum, data, $timeout) {
//         'ngInject';
//         //  fixing page not rendered in the first app entrance issue
//         $timeout(function () {
//             switch (data.diagnostic.status) {
//                 case ExerciseStatusEnum.COMPLETED.enum:
//                     var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
//                     if (isFirstWorkoutStarted) {
//                         $state.go('.summary');
//                     } else {
//                         $state.go('.preSummary');
//                     }
//                     break;
//                 default:
//                     $state.go('.intro');
//             }
//         });
//     }
// }
