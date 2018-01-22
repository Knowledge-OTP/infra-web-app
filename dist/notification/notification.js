(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.notification', [
        'znk.infra.auth',
        'znk.infra.storage'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.notification').factory('NotificationTypeEnum',
        ["EnumSrv", function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['PLAN_PENDING', 1, 'plan pending']
            ]);
        }]
    );
})(angular);


(function () {
    'use strict';

    angular.module('znk.infra-web-app.notification').run(
        ["$log", "InfraConfigSrv", "NotificationService", "AuthService", function ($log, InfraConfigSrv, NotificationService, AuthService) {
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
        }]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.notification').service('NotificationService',
        ["ENV", "$http", "AuthService", "$log", "InfraConfigSrv", function (ENV, $http, AuthService, $log, InfraConfigSrv) {
            'ngInject';

            var self = this;
            AuthService.getAuth().then(authData => {
                var uid = authData.uid;
                // subscribers list, callbacks grouped by the 'notificationTypeEnum'
                self.subscribers = [];
                self.notify = function (notificationOptions) {
                    // TODO: add backendNotificationUrl in all ENV
                    // send notification object to aws endpoint function
                    return $http.post(ENV.backendNotificationUrl, notificationOptions);
                };
                // subscribe for events
                self.on = function (notificationTypeEnum, callback) {
                    if (!uid) {
                        $log.error('uid is missing');
                        return;
                    }
                    if(typeof callback !== "function" ){
                        $log.error('callback property is not a function');
                        return;
                    }
                    var callbackList = self.subscribers[notificationTypeEnum];
                    if (callbackList) {
                        callbackList.push(callback);
                    } else {
                        callbackList = [callback];
                        self.subscribers[notificationTypeEnum] = callbackList;
                    }
                };
                // moves filtered notification by 'notificationTypeEnum' objects to archive (deprecated/on hold)
                self.clean = function (notificationTypeEnum) {
                    if (!uid) {
                        $log.error('uid is missing');
                        return;
                    }
                    var pathPending = "/notifications/users/" + uid + "/pending";
                    _getStorage().then(function (storage) {
                        storage.get(pathPending).then(function (snapshot) {
                            var notifications = snapshot.exportVal();
                            var notificationList = notifications.filter(function (item) {
                                return item.notificationTypeEnum === notificationTypeEnum;
                            });
                            var dataToMoveAndDelete = {};
                            for (var i = 0; i < notificationList.length; i++) {
                                var notificationData = notificationList[i];
                                if (!notificationData.id) {
                                    $log.debug("notification id for obj:" + JSON.stringify(notificationData) + "is null or empty");
                                    continue;
                                }
                                this.populateObjectForMoveAndDelete(notificationData, dataToMoveAndDelete);
                            }
                            _getStorage().then(function (storage) {
                                storage.update(dataToMoveAndDelete).catch(function (error) {
                                    $log.error("error: can not remove item, error: " + error.message);
                                });
                            });
                        });
                    });
                };
                // populate and prepare object for move and delete in firebase
                self.populateObjectForMoveAndDelete = function (notificationData, dataToMoveAndDelete) {
                    var pathForArchive = "/notifications/users/" + uid + "/archive/" + notificationData.id;
                    var pathForDelete = "/notifications/users/" + uid + "/pending/" + notificationData.id;
                    dataToMoveAndDelete[pathForArchive] = notificationData;
                    dataToMoveAndDelete[pathForDelete] = null;
                };
                function _getStorage() {
                    return InfraConfigSrv.getGlobalStorage();
                }
            });
        }]);
})(angular);

angular.module('znk.infra-web-app.notification').run(['$templateCache', function($templateCache) {

}]);
