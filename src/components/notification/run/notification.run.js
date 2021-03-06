(function () {
    'use strict';

    angular.module('znk.infra-web-app.notification').run(
        function ($log, InfraConfigSrv, NotificationService, AuthService) {
            'ngInject';

            AuthService.getAuth().then(authData => {
                var uid = authData.uid;
                var pathPending = "/notifications/users/" + uid + "/pending";
                if (!uid) {
                    $log.error('uid is missing');
                    return;
                }
                _getStorage().then(function (storage) {
                    // clear the pending path for user
                    storage.set(pathPending, {}).then(function () {
                        initFirebaseChildAddedEvents(storage);
                    });
                }).catch(function (error) {
                    $log.error(error);
                });

                // call and init firebase 'child_added' event
                function initFirebaseChildAddedEvents(storage) {
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
                        NotificationService.populateObjectForMoveAndDelete(notificationData, dataToMoveAndDelete);
                        _getStorage().then(function (storage) {
                            storage.update(dataToMoveAndDelete).catch(function (error) {
                                $log.error("error: can not remove item, error: " + error.message);
                            });
                        });
                    });
                }

                function _getStorage() {
                    return InfraConfigSrv.getGlobalStorage();
                }
            });
        });
})(angular);

