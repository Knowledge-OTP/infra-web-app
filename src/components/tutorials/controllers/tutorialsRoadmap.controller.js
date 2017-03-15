(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tutorials').controller('TutorialsRoadmapController',
        function (tutorials) {
            'ngInject';
            var vm = this;
            vm.tutorials = tutorials;
        }
    );
})(angular);
