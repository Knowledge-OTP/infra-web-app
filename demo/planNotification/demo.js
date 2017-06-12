(function(angular) {

    angular.module('demo', [
        'demoEnv',
        'znk.infra.auth',
        'znk.infra.storage',
        'znk.infra-web-app.planNotification'
    ])
        .decorator('ENV', function ($delegate) {
            'ngInject';

            $delegate.myZinkerz = '//dev.zinkerz.com/myZinkerz';
            $delegate.backendNotificationUrl = 'backend Notification Url';

            return $delegate;
        })
        .decorator('AuthService', function ($delegate) {
            'ngInject';

            $delegate.getAuth = function () {
                return { uid: 'cf656635-b44c-4fcc-82ef-72fe566d5540' };
            };
            return $delegate;
        })
        .controller('Main', function ($scope, PlanNotificationService) {

            $scope.openPlanNotification = function() {
                // var planId = 'planIdTest';
                var planId = '203233dc-a324-4ead-3f24-ca82556a2d70';
                PlanNotificationService.newPlanNotification({ refObjId: planId });
            };

        });
})(angular);
