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
                    }).catch(err => $log.error('isDarkFeaturesValid Error: ', err));
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
                // determine if student decline the live session request
                const isStudentDeclineTheSession = !liveSessionData.startTime;

                if (liveSessionData.educatorId === currUid) {
                    LiveSessionSrv.hangCall(liveSessionData.studentId);
                    LiveSessionSrv._destroyCheckDurationInterval();
                }

                if (isStudentDeclineTheSession) {
                    if (liveSessionData.educatorId === currUid) {
                        LiveSessionUiSrv.showStudentDeclineSessionPopup();
                    }
                } else {
                    LiveSessionUiSrv.showEndSessionPopup().then(() => {
                        LiveSessionUiSrv.isDarkFeaturesValid(liveSessionData.educatorId, liveSessionData.studentId)
                            .then(isDarkFeaturesValid => isDarkFeaturesValid ?
                                LiveSessionEventsSrv._handelLiveSession(liveSessionData) : $log.debug('darkFeatures in OFF'))
                            .catch(err => $log.error('isDarkFeaturesValid Error: ', err));
                    });
                }

                LiveSessionSrv._userLiveSessionStateChanged(UserLiveSessionStateEnum.NONE.enum, liveSessionData);
                // Security check to insure there isn't active session
                LiveSessionSrv._moveToArchive(liveSessionData);
            };

            LiveSessionEventsSrv._handelLiveSession = (liveSessionData) => {
                if (LiveSessionSrv.scheduledLessonFromAdapter &&
                    LiveSessionSrv.scheduledLessonFromAdapter.lessonSummaryId) {
                    ZnkLessonNotesSrv.getLessonSummaryById(liveSessionData.lessonSummaryId)
                        .then(lessonSummary => {
                            lessonSummary = lessonSummary || ZnkLessonNotesUiSrv.newLessonSummary(liveSessionData);
                            if (liveSessionData.educatorId === currUid) {
                                ZnkLessonNotesUiSrv.openLessonNotesPopup(LiveSessionSrv.scheduledLessonFromAdapter, lessonSummary, UserTypeContextEnum.EDUCATOR.enum);
                            } else {
                                ZnkLessonNotesUiSrv.openLessonRatingPopup(LiveSessionSrv.scheduledLessonFromAdapter, lessonSummary);
                            }
                        });
                } else {
                    $log.debug('endLiveSession: There is NO lessonSummaryId on liveSessionData');
                }

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
