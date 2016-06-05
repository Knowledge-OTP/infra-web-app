(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticController', function($state, currentState, $translatePartialLoader) {
        'ngInject';

        var EXAM_STATE = 'diagnostic';

        $translatePartialLoader.addPart('diagnosticExercise');

        $state.go(EXAM_STATE + currentState.state, currentState.params);
    });
})(angular);

