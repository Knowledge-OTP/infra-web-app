(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionEventsSrv', function () {
        'ngInject';
        let isEnabled = true;

        this.enabled = (_isEnabled) => {
            isEnabled = _isEnabled;
        };

        this.$get = function (UserProfileService, InfraConfigSrv, $q, StorageSrv, ENV, LiveSessionStatusEnum,
                     UserLiveSessionStateEnum, $log, LiveSessionUiSrv, LiveSessionSrv,
                     LiveSessionDataGetterSrv, ZnkLessonNotesSrv, UserTypeContextEnum,
                     ZnkLessonNotesUiSrv) {

            let currUid = null;
            let LiveSessionEventsSrv = {};

            LiveSessionEventsSrv._listenToLiveSessionData = (guid) => {
                let liveSessionDataPath = LiveSessionDataGetterSrv.getLiveSessionDataPath(guid);

                InfraConfigSrv.getGlobalStorage().then(globalStorage => {
                    globalStorage.onEvent(StorageSrv.EVENTS.VALUE, liveSessionDataPath, LiveSessionEventsSrv._cb);
                });
            };

            LiveSessionEventsSrv._handelLiveSessionPendingStudent = (liveSessionData) => {
                LiveSessionUiSrv.isDarkFeaturesValid(liveSessionData.educatorId, liveSessionData.studentId)
                    .then(isDarkFeaturesValid => {
                        if (isDarkFeaturesValid) {
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
                        } else {
                            if (liveSessionData.studentId === currUid) {
                                LiveSessionSrv.confirmLiveSession(liveSessionData.guid);
                            }
                        }
                    });
            };

            LiveSessionEventsSrv._handelLiveSessionConfirmed = (liveSessionData) => {
                LiveSessionUiSrv.closePopup();
                LiveSessionUiSrv.showLiveSessionToast();
                let userLiveSessionState = UserLiveSessionStateEnum.NONE.enum;

                if (liveSessionData.studentId === currUid) {
                    userLiveSessionState = UserLiveSessionStateEnum.STUDENT.enum;
                }

                if (liveSessionData.educatorId === currUid) {
                    userLiveSessionState = UserLiveSessionStateEnum.EDUCATOR.enum;
                    LiveSessionSrv.makeAutoCall(liveSessionData.studentId, liveSessionData.guid);
                }

                if (userLiveSessionState !== UserLiveSessionStateEnum.NONE.enum) {
                    LiveSessionSrv._userLiveSessionStateChanged(userLiveSessionState, liveSessionData);
                }
            };

            LiveSessionEventsSrv._handelLiveSessionEnded = (liveSessionData) => {
                LiveSessionUiSrv.closePopup();
                if (liveSessionData.studentId !== currUid) {
                    LiveSessionSrv.hangCall(liveSessionData.studentId);
                    LiveSessionSrv._destroyCheckDurationInterval();
                }

                LiveSessionUiSrv.showEndSessionPopup()
                    .then(() => {
                        LiveSessionUiSrv.isDarkFeaturesValid(liveSessionData.educatorId, liveSessionData.studentId)
                            .then(isDarkFeaturesValid => {
                                if (isDarkFeaturesValid) {
                                    $log.debug('darkFeatures in ON');
                                    if (liveSessionData.lessonId) {
                                        ZnkLessonNotesSrv.getLessonById(liveSessionData.lessonId).then(lesson => {
                                            if (liveSessionData.educatorId === currUid) {
                                                ZnkLessonNotesUiSrv.openLessonNotesPopup(lesson, UserTypeContextEnum.EDUCATOR.enum);
                                            } else {
                                                ZnkLessonNotesUiSrv.openLessonRatingPopup(lesson, UserTypeContextEnum.STUDENT.enum);
                                            }

                                        });
                                    } else {
                                        $log.debug('endLiveSession: There is NO lessonId on liveSessionData');
                                    }
                                } else {
                                    $log.debug('darkFeatures in OFF');
                                }
                            });
                    });
                LiveSessionSrv._userLiveSessionStateChanged(UserLiveSessionStateEnum.NONE.enum, liveSessionData);
                // Security check to insure there isn't active session
                LiveSessionSrv._moveToArchive(liveSessionData);
            };

            LiveSessionEventsSrv._cb = (liveSessionData) => {
                if (!liveSessionData || !currUid) {
                    return;
                }

                switch (liveSessionData.status) {
                    case LiveSessionStatusEnum.PENDING_STUDENT.enum:
                        LiveSessionEventsSrv._handelLiveSessionPendingStudent(liveSessionData);
                        break;

                    case LiveSessionStatusEnum.CONFIRMED.enum:
                        LiveSessionEventsSrv._handelLiveSessionConfirmed(liveSessionData);
                        break;

                    case LiveSessionStatusEnum.ENDED.enum:
                        LiveSessionEventsSrv._handelLiveSessionEnded(liveSessionData);
                        break;

                    default:
                        $log.error('LiveSessionEventsSrv: invalid status was received ' + liveSessionData.status);
                }

                LiveSessionSrv._liveSessionDataChanged(liveSessionData);
            };

            LiveSessionEventsSrv._startListening = () => {
                UserProfileService.getCurrUserId().then((currUserId) => {
                    currUid = currUserId;
                    InfraConfigSrv.getGlobalStorage().then(globalStorage => {
                        let appName = ENV.firebaseAppScopeName;
                        let userLiveSessionPath = appName + '/users/' + currUid + '/liveSession/active';
                        globalStorage.onEvent(StorageSrv.EVENTS.VALUE, userLiveSessionPath, LiveSessionEventsSrv._listenToUserActivePath);
                    });
                });
            };

            LiveSessionEventsSrv._listenToUserActivePath = (userLiveSessionGuids) => {
                if (userLiveSessionGuids) {
                    userLiveSessionGuids = Array.isArray(userLiveSessionGuids) ? userLiveSessionGuids : Object.keys(userLiveSessionGuids);
                    userLiveSessionGuids.forEach(guid => {
                        if (guid) {
                            LiveSessionEventsSrv._listenToLiveSessionData(guid);
                        } else {
                            $log.debug('_listenToUserActivePath: Invalid guid');
                        }
                    });
                }
            };

            LiveSessionEventsSrv.activate = () => {
                if (isEnabled) {
                    LiveSessionEventsSrv._startListening();
                }
            };

            return LiveSessionEventsSrv;
        };
    });
})(angular);
