(function (angular) {
    'use strict';

    angular.module('demo').controller('DemoController',
        function (diagnosticData, testsData) {
            'ngInject';
            var vm = this;

            vm.exams = testsData.exams;
            vm.examsResults = testsData.examsResults;
        }
    );
})(angular);
