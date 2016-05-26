"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        function (/*WorkoutsDiagnosticFlow*/) {
            'ngInject';

            var vm = this;

            vm.state = 'workouts roadmap diagnostic intro';

            // WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {todo
            //     vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
            // });
            vm.buttonTitle = 'START';
        });
})();

// export class WorkoutsRoadMapDiagnosticIntroController {
//     constructor(WorkoutsDiagnosticFlow) {
//         'ngInject';
//
//         var vm = this;
//
//         vm.state = 'workouts roadmap diagnostic intro';
//
//         WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {
//             vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
//         });
//     }
// }
