(function (angular) {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        function (isDiagnosticStarted) {
            'ngInject';

            var vm = this;

            vm.buttonTitle = isDiagnosticStarted ? 'CONTINUE' : 'START' ;
        });
})(angular);

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
