/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane', 
        function () {
            'ngInject';
            return {
                scope: {
                    activeExam: '=?',
                    exams: '=',
                    onExamClick: '&',
                    title: '@',
                    examsResults: '='
                },
                restrict: 'E',
                templateUrl: 'components/tests/templates/navigationPane.template.html',
                controller: 'NavigationPane.controller',
                bindToController: true,
                controllerAs: 'navigationPane.controller',
                link: function (scope, element, attrs) {
                }
            };
        }
    );
})(angular);

