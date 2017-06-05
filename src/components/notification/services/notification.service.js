(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.notification').service('NotificationService', function (ENV, $http, UtilitySrv) {
        var self = this;
        var uid = AuthService.getAuth().uid;

        self.notify = function (notificationOptions) {
            return $http.post(ENV.backendNotificationUrl, notificationOptions);
        }
        self.on = function (notificationTypeEnum, callback) {
            if (!uid) {
                return;
            }
            var type = "notification_" + notificationTypeEnum;
            var pathPending = "/notifications/users/" + uid + "/pending";
            _getStorage().then(function (storage) {
                storage.onEvent('child_added', pathPending, function (dataSnapshot) {
                    callback(dataSnapshot.val());
                })
            });
        }
        self.clean = function (notificationTypeEnum) {
            if (!uid) {
                return;
            }
            var newGuid = UtilitySrv.general.createGuid();
            const pathArchive = "/notifications/users/" + uid + "/" + newGuid + "/archive";
            _getStorage().then(function (storage) {
                storage.get(pathArchive).then(function (dataSnapshot) {
                    var list = dataSnapshot.val();
                    list.forEach(function (notification) {
                        callback(notification);
                    });
                });
            });

        }
        function _getStorage() {
            return InfraConfigSrv.getGlobalStorage();
        }
    });
})(angular);
