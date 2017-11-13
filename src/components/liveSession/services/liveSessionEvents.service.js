(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionEventsSrv', function () {
        let isEnabled = true;

        this.enabled = function (_isEnabled) {
            isEnabled = _isEnabled;
        };

        this.$get = function (UserProfileService, InfraConfigSrv, $q, StorageSrv, ENV, LiveSessionStatusEnum,
                              UserLiveSessionStateEnum, $log, LiveSessionUiSrv, LiveSessionSrv,
                              LiveSessionDataGetterSrv, ZnkLessonNotesSrv) {
            'ngInject';

            let LiveSessionEventsSrv = {};
            let currUid = null;

            function _listenToLiveSessionData(guid) {
                let liveSessionDataPath = LiveSessionDataGetterSrv.getLiveSessionDataPath(guid);

                function _cb(liveSessionData) {
                    if (!liveSessionData || !currUid) {
                        return;
                    }

                    switch (liveSessionData.status) {
                        case LiveSessionStatusEnum.PENDING_STUDENT.enum:
                            if (liveSessionData.studentId === currUid) {
                                LiveSessionUiSrv.showStudentConfirmationPopUp()
                                    .then(() => {
                                        LiveSessionSrv.confirmLiveSession(liveSessionData.guid);
                                    }, () => {
                                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                                    });
                            } else {
                                LiveSessionUiSrv.showEducatorPendingPopUp();
                            }
                            break;

                        case LiveSessionStatusEnum.CONFIRMED.enum:
                            LiveSessionUiSrv.closePopup();
                            LiveSessionUiSrv.showLiveSessionToast();
                            let userLiveSessionState = UserLiveSessionStateEnum.NONE.enum;

                            if (liveSessionData.studentId === currUid) {
                                userLiveSessionState = UserLiveSessionStateEnum.STUDENT.enum;
                            }

                            if (liveSessionData.educatorId === currUid) {
                                userLiveSessionState = UserLiveSessionStateEnum.EDUCATOR.enum;

                            }

                            if (userLiveSessionState !== UserLiveSessionStateEnum.NONE.enum) {
                                LiveSessionSrv._userLiveSessionStateChanged(userLiveSessionState, liveSessionData);
                            }

                            break;

                        case LiveSessionStatusEnum.ENDED.enum:
                            LiveSessionUiSrv.closePopup();
                            if (liveSessionData.studentId !== currUid) {
                                LiveSessionSrv.hangCall(liveSessionData.studentId);
                                LiveSessionSrv._destroyCheckDurationInterval();
                            }

                            LiveSessionUiSrv.showEndSessionPopup()
                                .then(function () {
                                    ZnkLessonNotesSrv.openLessonNotesPopup();
                                });
                            LiveSessionSrv._userLiveSessionStateChanged(UserLiveSessionStateEnum.NONE.enum, liveSessionData);
                            // Security check to insure there isn't active session
                            LiveSessionSrv._moveToArchive(liveSessionData);
                            break;

                        default:
                            $log.error('LiveSessionEventsSrv: invalid status was received ' + liveSessionData.status);
                    }

                    LiveSessionSrv._liveSessionDataChanged(liveSessionData);
                }

                InfraConfigSrv.getGlobalStorage().then(globalStorage => {
                    globalStorage.onEvent(StorageSrv.EVENTS.VALUE, liveSessionDataPath, _cb);
                });
            }

            // function _listenToHangoutsInvitation() {
            //     UserProfileService.getCurrUserId().then(function (currUid) {
            //         InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
            //             var appName = ENV.firebaseAppScopeName;
            //             var userLiveSessionPath = appName + '/users/' + currUid + '/liveSession/hangoutsSession';
            //             globalStorage.onEvent(StorageSrv.EVENTS.VALUE, userLiveSessionPath, function (hangoutsSessionGuid) {
            //                 if (hangoutsSessionGuid) {
            //                     _listenToLiveSessionData(hangoutsSessionGuid);
            //                 }
            //             });
            //         });
            //     });
            // }

            function _startListening() {
                UserProfileService.getCurrUserId().then((currUserId) => {
                    currUid = currUserId;
                    InfraConfigSrv.getGlobalStorage().then(globalStorage => {
                        let appName = ENV.firebaseAppScopeName;
                        let userLiveSessionPath = appName + '/users/' + currUid + '/liveSession/active';
                        globalStorage.onEvent(StorageSrv.EVENTS.VALUE, userLiveSessionPath, _listenToUserActivePath);
                    });
                });
            }

            function _listenToUserActivePath(userLiveSessionGuids) {
                if (userLiveSessionGuids) {
                    userLiveSessionGuids = Array.isArray(userLiveSessionGuids) ? userLiveSessionGuids : Object.keys(userLiveSessionGuids);
                    userLiveSessionGuids.forEach(guid => {
                        if (guid) {
                            _listenToLiveSessionData(guid);
                        } else {
                            $log.debug('_listenToUserActivePath: Invalid guid');
                        }
                    });
                }
            }

            function activate() {
                if (isEnabled) {
                    _startListening();
                    // _listenToHangoutsInvitation();
                }
            }

            LiveSessionEventsSrv.activate = activate;

            return LiveSessionEventsSrv;
        };
    });
})(angular);
