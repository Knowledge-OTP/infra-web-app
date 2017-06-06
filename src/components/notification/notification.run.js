(function () {
    'use strict';

    angular.module('znk.infra-web-app.notification').run(function ($log, InfraConfigSrv, NotificationService, AuthService) {
        'ngInject';

        var uid = AuthService.getAuth().uid;
        var pathPending = "/notifications/users/" + uid + "/pending";
        if (!uid) {
            $log.error('uid is missing');
            return;
        }
        _getStorage().then(function (storage) {
            storage.onEvent('child_added', pathPending, function (dataSnapshot) {
                var notificationData = dataSnapshot.val();
                var callbackList = NotificationService.subscribers[notificationData.notificationTypeEnum];
                if (!callbackList) {
                    $log.log('no subscribers');
                }
                callbackList.forEach(function (callback) {
                    callback(notificationData);
                    if (!notificationData.id) {
                        $log.error('notification id is null or empty');
                    }
                });
                var dataToMoveAndDelete = {};
                NotificationService.createObjectForMoveAndDelete(notificationData, dataToMoveAndDelete);
                _getStorage().then(function (storage) {
                    storage.update(dataToMoveAndDelete).catch(function (error) {
                        $log.error("error: can not remove item, error: " + error.message);
                    });
                });
            });
        });

        function _getStorage() {
            return InfraConfigSrv.getGlobalStorage();
        }
    });
})(angular);

