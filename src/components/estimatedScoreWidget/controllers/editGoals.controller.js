(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').controller('EditGoals.controller',
        function ($scope, $filter, $mdDialog) {
            'ngInject';
            var translateFilter = $filter('translate');
            $scope.hello = 'hello';
            $scope.userGoalsSetting = {
                recommendedGoalsTitle: false,
                saveBtn: {
                    title: translateFilter('USER_GOALS.SAVE'),
                    afterSaveTitle: translateFilter('USER_GOALS.SAVED'),
                    wrapperClassName: 'btn-sm'
                }
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
    );
})(angular);
