(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        function (isDiagnosticStarted) {
            'ngInject';

            var vm = this;

            vm.buttonTitle = isDiagnosticStarted ? '.CONTINUE_TEST' : '.START_TEST' ;
        });
})(angular);
