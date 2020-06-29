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
                                    .then((resolveReason) => {
                                        // Making sure the user actually clicked "JOIN" and we did not close the popup from the code automatically
                                        if (resolveReason && resolveReason.toLowerCase() === 'join') {
                                            LiveSessionSrv.confirmLiveSession(liveSessionData.guid);
                                        }
                                    }, () => {
                                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                                    });
                            } else {
                                LiveSessionUiSrv.showEducatorPendingPopUp().then((resolveReason) => {
                                    // Making sure the user actually clicked "CANCEL" (only button in this popup) and we did not close the popup from the code automatically
                                    if (resolveReason && resolveReason.toLowerCase() === 'cancel') {
                                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                                    }
                                });
                            }
                        } else {
                            if (liveSessionData.educatorId === currUid) {
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
                    LiveSessionSrv._updateLessonsStatusToAttended(liveSessionData)
                        .then((updatedLessons) => {
                            $log.debug('_updateLessonsStatusToAttended: Lessons status successfully updated.', JSON.stringify(updatedLessons));
                        });
                    ZnkLessonNotesSrv.getLessonSummaryById(liveSessionData.lessonSummaryId).then(lessonSummary => {
                        if (lessonSummary) {
                            lessonSummary.startTime = liveSessionData.startTime;
                            if (!lessonSummary.liveSessions.includes(liveSessionData.guid)) {
                                lessonSummary.liveSessions.push(liveSessionData.guid);
                            }
                            ZnkLessonNotesSrv.saveLessonSummary(lessonSummary).then(updatedLessonSummary=> {
                                $log.debug('_handelLiveSessionConfirmed: saveLessonSummary: LessonSummary successfully updated: ', updatedLessonSummary.id);
                            }).catch(err => {
                                $log.debug('_handelLiveSessionConfirmed: saveLessonSummary: Error updating: ', lessonSummary.id, ' Err: ', err);
                            });
                        } else {
                            $log.debug('_handelLiveSessionConfirmed: No lessonSummary.');
                        }
                    }).catch(err => {
                        $log.debug('_handelLiveSessionConfirmed: getLessonSummaryById Error: ', JSON.stringify(err));
                    });
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
                            .then(isDarkFeaturesValid => {
                                if (isDarkFeaturesValid) {
                                    LiveSessionEventsSrv._handelLessonSummary(liveSessionData)
                                        .then(() => LiveSessionSrv.clearScheduledLessonData());
                                } else {
                                    $log.debug('darkFeatures in OFF');
                                    LiveSessionSrv.clearScheduledLessonData();
                                }
                            })
                            .catch(err => $log.error('isDarkFeaturesValid Error: ', err));
                    });
                }

                LiveSessionSrv._userLiveSessionStateChanged(UserLiveSessionStateEnum.NONE.enum, liveSessionData);
                // Security check to insure there isn't active session
                LiveSessionSrv._moveToArchive(liveSessionData);
            };

            LiveSessionEventsSrv._handelLessonSummary = (liveSessionData) => {
                return LiveSessionSrv.getScheduledLessonData(liveSessionData.lessonId).then(scheduledLesson => {
                    if (scheduledLesson) {
                        if (scheduledLesson.lessonSummaryId) {
                            $log.debug('_handelLessonSummary: getLessonSummaryById: ', scheduledLesson.lessonSummaryId);
                            ZnkLessonNotesSrv.getLessonSummaryById(liveSessionData.lessonSummaryId)
                                .then(lessonSummary => {
                                    if (lessonSummary) {
                                        if (liveSessionData.educatorId === currUid) {
                                            lessonSummary = ZnkLessonNotesUiSrv.updateLessonSummaryFromLiveSessionData(lessonSummary, liveSessionData);
                                        }
                                        scheduledLesson.lessonSummaryId = scheduledLesson.lessonSummaryId || lessonSummary.id;
                                        let promToReturn;
                                        if (liveSessionData.educatorId === currUid) {
                                            //promToReturn = ZnkLessonNotesUiSrv.openLessonNotesPopup(scheduledLesson, lessonSummary, UserTypeContextEnum.EDUCATOR.enum);
                                        } else {
                                            promToReturn = ZnkLessonNotesUiSrv.openLessonRatingPopup(scheduledLesson, lessonSummary);
                                        }
                                        return promToReturn;
                                    } else {
                                        $log.error('_handelLessonSummary: Error: lessonSummary is required');
                                    }
                                });
                        } else {
                            $log.error('_handelLessonSummary: Lesson summary id is required');
                        }
                    } else {
                        $log.error('_handelLessonSummary: scheduledLesson is required');
                    }
                });
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
