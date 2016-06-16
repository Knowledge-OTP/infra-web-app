/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.testNavigation').directive('navigationPane', 
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
                templateUrl: 'components/testNavigation/templates/navigationPane.template.html',
                controller: 'NavigationPane.controller',
                bindToController: true,
                controllerAs: 'navigationPane.controller',
                link: function (scope, element, attrs) {
                }
            };
        }
    );
})(angular);

