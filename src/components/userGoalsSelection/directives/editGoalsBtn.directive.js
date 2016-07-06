(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('editGoalsBtn', function GoalSelectDirective() {

        var directive = {
            restrict: 'A',
            templateUrl: 'components/userGoalsSelection/templates/goalSelect.template.html',
            link: function link(scope) {
                scope.d = {};
                scope.d.showGoalsEdit = function () {
                    $mdDialog.show({
                        controller: 'EditGoalsController',
                        controllerAs: 'vm',
                        templateUrl: 'components/userGoalsSelection/templates/editGoals.template.html',
                        clickOutsideToClose: false
                    });
                };
            }
        };

        return directive;
    });

})(angular);
