(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise')
        .controller('WorkoutsDiagnosticController', function($state, currentState) {
        'ngInject';

        var EXAM_STATE = 'app.diagnostic';


        $state.go(EXAM_STATE + currentState.state, currentState.params);
    });
})(angular);

