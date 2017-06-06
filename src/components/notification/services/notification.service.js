(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.notification').service('NotificationService', function (ENV, $http, UtilitySrv) {
        'ngInject';

        var self = this;
        var uid = AuthService.getAuth().uid;
        self.subscribers = [];
        self.notify = function (notificationOptions) {
            // TODO add backendNotificationUrl in allENV
            return $http.post(ENV.backendNotificationUrl, notificationOptions);
        }
        self.on = function (notificationTypeEnum, callback) {
            if (!uid) {
                return;
            }
            var callbackList = self.subscribers[notificationTypeEnum];
            if (callbackList) {
                callbackList.push(callback);
            } else {
                callbackList = [callback];
                self.subscribers[notificationTypeEnum] = callbackList;
            }
        }
        self.clean = function (notificationTypeEnum) {
            if (!uid) {
                return;
            }
            var pathPending = "/notifications/users/" + uid + "/pending";
            _getStorage().then(function (storage) {
                storage.get(pathPending).then(function (snapshot) {
                    var notifications = snapshot.val();
                    var notificationList = notifications.filter(function (item) {
                        return item.notificationTypeEnum === notificationTypeEnum;
                    });
                    var dataToMoveAndDelete = {};
                    for (var i = 0; i < notificationList.length; i++) {
                        var notificationData = notificationList[i];
                        if (!notificationData.id) {
                            this.logger.log("notification id for obj:" + JSON.stringify(notificationData) + "is null or empty");
                            continue;
                        }
                        this.createObjectForMoveAndDelete(notificationData, dataToMoveAndDelete);
                    }
                    _getStorage().then(function (storage) {
                        storage.update(dataToMoveAndDelete).catch(function (error) {
                            $log.error("error: can not remove item, error: " + error.message);
                        });
                    });
                });
            });
        }

        self.createObjectForMoveAndDelete = function (notificationData, dataToMoveAndDelete) {
            var newGuid = UtilitySrv.general.createGuid();
            var pathForArchive = "/notifications/users/" + uid + "/" + newGuid + "/archive";
            var pathForDelete = "/notifications/users/" + uid + "/" + notificationData.id + "/pending";
            dataToMoveAndDelete[pathForArchive] = notificationData;
            dataToMoveAndDelete[pathForDelete] = null;
        }
        function _getStorage() {
            return InfraConfigSrv.getGlobalStorage();
        }
    });
})(angular);
