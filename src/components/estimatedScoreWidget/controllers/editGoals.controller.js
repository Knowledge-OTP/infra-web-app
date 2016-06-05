(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').controller('EditGoals.controller',
        function ($filter, $mdDialog) {
            'ngInject';
            var translateFilter = $filter('translate');
            this.userGoalsSetting = {
                recommendedGoalsTitle: false,
                saveBtn: {
                    title: translateFilter('USER_GOALS.SAVE'),
                    afterSaveTitle: translateFilter('USER_GOALS.SAVED'),
                    wrapperClassName: 'btn-sm'
                }
            };

            this.cancel = function () {
                $mdDialog.cancel();
            };
        }
    );
})(angular);
