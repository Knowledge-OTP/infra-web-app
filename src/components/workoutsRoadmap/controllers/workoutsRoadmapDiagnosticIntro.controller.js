(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        function (isDiagnosticStarted, DiagnosticSrv) {
            'ngInject';

            var vm = this;

            vm.forceSkipIntro = DiagnosticSrv.forceSkipIntro ? DiagnosticSrv.forceSkipIntro : false;

            vm.buttonTitle = isDiagnosticStarted ? '.CONTINUE_TEST' : '.START_TEST';
        });
})(angular);
