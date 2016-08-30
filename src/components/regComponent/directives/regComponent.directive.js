/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.regComponent').directive('regComponent', [
        '$translatePartialLoader',
        function ($translatePartialLoader) {
            return {
                templateUrl: 'components/regComponent/templates/regComponent.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('regComponent');
                    scope.vm = {};
                    scope.data = {};

                    scope.data.appSelect = {id: 'SAT', name: 'SAT'};

                    scope.contextObj = {
                        // appContext: '',
                        // userContext: ''
                    };

                    scope.showLogin = false;
                    scope.showSignup = true;

                    scope.availableApps = [
                        {
                            id: 'SAT',
                            name: 'SAT'
                        },
                        {
                            id: 'ACT',
                            name: 'ACT'
                        }
                    ];

                    // scope.appSelect = {id: 'SAT', name: 'SAT'};
                }
            };
        }
    ]);
})(angular);
