(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tutorials').controller('TutorialsRoadmapController',
        function ($translatePartialLoader, tutorials) {
            'ngInject';
            $translatePartialLoader.addPart('tutorials');
            var vm = this;
            vm.tutorials = tutorials;
        }
    );
})(angular);
