(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic').controller('WorkoutsDiagnosticController', function($state, currentState, $translatePartialLoader) {
        'ngInject';

        var EXAM_STATE = 'diagnostic';

        $translatePartialLoader.addPart(EXAM_STATE);

        $state.go(EXAM_STATE + currentState.state, currentState.params);
    });
})(angular);

