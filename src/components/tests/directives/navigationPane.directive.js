/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane',
        function ($translatePartialLoader) {
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
                controller: 'NavigationPaneController',
                bindToController: true,
                controllerAs: 'vm',
                link: function (element, scope) {
                    $translatePartialLoader.addPart('tests');
                }
            };
        }
    );
})(angular);

