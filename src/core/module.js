(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app', [
        'znk.infra-web-app.angularMaterialOverride',
        'znk.infra-web-app.config',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.diagnosticExercise',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra-web-app.estimatedScoreWidget',
        'znk.infra-web-app.iapMsg',
        'znk.infra-web-app.infraWebAppZnkExercise',
        'znk.infra-web-app.invitation',
        'znk.infra-web-app.onBoarding',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.socialSharing',
        'znk.infra-web-app.uiTheme',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.workoutsRoadmap',
        'znk.infra-web-app.znkExerciseStates',
        'znk.infra-web-app.znkHeader'
    ]);
})(angular);
