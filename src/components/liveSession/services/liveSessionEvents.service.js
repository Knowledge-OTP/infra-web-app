(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionEventsSrv', function () {
        var isEnabled = true;

        this.enabled = function (_isEnabled) {
            isEnabled = _isEnabled;
        };

        this.$get = function (UserProfileService, InfraConfigSrv, $q, StorageSrv, ENV, LiveSessionStatusEnum,
                              UserLiveSessionStateEnum, $log, LiveSessionUiSrv, LiveSessionSrv, LiveSessionDataGetterSrv) {
            'ngInject';

            var LiveSessionEventsSrv = {};

            function _listenToLiveSessionData(guid) {
                var liveSessionDataPath = LiveSessionDataGetterSrv.getLiveSessionDataPath(guid);

                function _cb(liveSessionData) {
                    if (!liveSessionData) {
                        return;
                    }

                    UserProfileService.getCurrUserId().then(function (currUid) {
                        switch (liveSessionData.status) {
                            case LiveSessionStatusEnum.PENDING_STUDENT.enum:
                                if (liveSessionData.studentId === currUid) {
                                    LiveSessionUiSrv.showStudentLiveSessionPopUp()
                                        .then(function () {
                                            LiveSessionSrv.confirmLiveSession(liveSessionData.guid);
                                        }, function () {
                                            LiveSessionSrv.endLiveSession(liveSessionData.guid);
                                        });
                                }
                                break;
                            case LiveSessionStatusEnum.CONFIRMED.enum:
                                var userLiveSessionState = UserLiveSessionStateEnum.NONE.enum;

                                if (liveSessionData.studentId === currUid) {
                                    userLiveSessionState = UserLiveSessionStateEnum.STUDENT.enum;
                                }

                                if (liveSessionData.educatorId === currUid) {
                                    userLiveSessionState = UserLiveSessionStateEnum.EDUCATOR.enum;
                                    LiveSessionSrv.makeAutoCall(liveSessionData.studentId);
                                }

                                if (userLiveSessionState !== UserLiveSessionStateEnum.NONE.enum) {
                                    LiveSessionSrv._userLiveSessionStateChanged(userLiveSessionState, liveSessionData);
                                }

                                break;
                            case LiveSessionStatusEnum.ENDED.enum:
                                if (liveSessionData.studentId !== currUid) {
                                    LiveSessionSrv.hangCall(liveSessionData.studentId);
                                    LiveSessionSrv._destroyCheckDurationInterval();
                                }

                                LiveSessionUiSrv.showEndSessionPopup()
                                    .then(function () {
                                        LiveSessionSrv.showLessonNotesPopup(liveSessionData.guid);
                                    });
                                LiveSessionSrv._userLiveSessionStateChanged(UserLiveSessionStateEnum.NONE.enum, liveSessionData);
                                // Security check to insure there isn't active session
                                LiveSessionSrv._moveToArchive(liveSessionData);
                                break;
                            default:
                                $log.error('LiveSessionEventsSrv: invalid status was received ' + liveSessionData.status);
                        }

                        LiveSessionSrv._liveSessionDataChanged(liveSessionData);
                    });
                }

                InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
                    globalStorage.onEvent(StorageSrv.EVENTS.VALUE, liveSessionDataPath, _cb);
                });
            }

            function _startListening() {
                UserProfileService.getCurrUserId().then(function (currUid) {
                    InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
                        var appName = ENV.firebaseAppScopeName;
                        var userLiveSessionPath = appName + '/users/' + currUid + '/liveSession/active';
                        globalStorage.onEvent(StorageSrv.EVENTS.VALUE, userLiveSessionPath, function (userLiveSessionGuids) {
                            if (userLiveSessionGuids) {
                                angular.forEach(userLiveSessionGuids, function (isActive, guid) {
                                    if (isActive) {
                                        _listenToLiveSessionData(guid);
                                    }
                                });
                            }
                        });
                    });
                });
            }

            function activate() {
                if (isEnabled) {
                    _startListening();
                }
            }

            LiveSessionEventsSrv.activate = activate;

            return LiveSessionEventsSrv;
        };
    });
})(angular);
