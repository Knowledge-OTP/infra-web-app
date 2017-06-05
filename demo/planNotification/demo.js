(function(angular) {

    angular.module('demo', ['znk.infra-web-app.planNotification'])
        .decorator('NotificationTypeEnum', function ($delegate) {
            'ngInject';
            $delegate.planCreated = function () {
                return 1;
            };
            return $delegate;
        })
        .decorator('NotificationService', function ($delegate) {
            'ngInject';
            $delegate.clean = function (notificationType) {
                console.log('notificationType: ' + notificationType);
            };

            $delegate.on = function (notificationType, cb) {
                var notification = {
                    id: "0007a550-0148-4c60-9c1c-c8575a8ac5d5",
                    toUid: "0007a550-0148-4c60-9c1c-c8575a8ac5d5",
                    fromUid: "1117a550-0148-4c60-9c1c-c8575a8ac5d5",
                    subject: "Pan Created",
                    body: "Plan was Created",
                    seen: true,
                    notificationType: 1,
                    serviceId: 1
                };
                cb(notification)
            };

            return $delegate;
        })
        .controller('Main', function ($scope, PlanNotificationService) {

            $scope.openPlanNotification = function() {
                var planId = 'planIdTest';
                PlanNotificationService.newPlanNotification({ refObjId: planId });
            };

        });
})(angular);
