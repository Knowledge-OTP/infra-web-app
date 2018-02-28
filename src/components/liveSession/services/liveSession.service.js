(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').service('LiveSessionSrv',
        function (UserProfileService, InfraConfigSrv, $q, UtilitySrv, LiveSessionDataGetterSrv, LiveSessionStatusEnum,
                  ENV, $log, UserLiveSessionStateEnum, LiveSessionUiSrv, $interval, CallsSrv, CallsErrorSrv,
                  ZnkLessonNotesSrv, LessonStatusEnum, LessonNotesStatusEnum, $window, LiveSessionSubjectSrv) {
            'ngInject';

            let SESSION_SETTINGS = {
                length: ENV.liveSession.length,
                extendTime: ENV.liveSession.sessionExtendTime,
            };

            let activeLiveSessionDataFromAdapter = null;
            let currUserLiveSessionState = UserLiveSessionStateEnum.NONE.enum;
            let registeredCbToActiveLiveSessionDataChanges = [];
            let registeredCbToCurrUserLiveSessionStateChange = [];
            let liveSessionInterval = {};
            let isTeacherApp = (ENV.appContext.toLowerCase()) === 'dashboard';
            let scheduledLessonFromAdapter = null;

            // return the live session obj data from adapter
            this.getScheduledLessonData = (lessonId) => {
                if (scheduledLessonFromAdapter) {
                    return $q.resolve(scheduledLessonFromAdapter);
                } else {
                    $log.debug('getScheduledLessonData: getLessonById: ', lessonId);
                    return ZnkLessonNotesSrv.getLessonById(lessonId);
                }
            };

            // clear the live session obj data from adapter
            this.clearScheduledLessonData = () => {
                scheduledLessonFromAdapter = null;
            };

            // get the educator date and start the session
            this.startLiveSession = (studentData, lessonData) => {
                return UserProfileService.getCurrUserId().then((currUserId) => {
                    let educatorData = {
                        uid: currUserId,
                        isTeacher: isTeacherApp

                    };

                    scheduledLessonFromAdapter = lessonData.scheduledLesson || null;

                    return this._initiateLiveSession(educatorData, studentData, lessonData, UserLiveSessionStateEnum.EDUCATOR.enum);
                });
            };

            // student live session confirmation
            this.confirmLiveSession = (liveSessionGuid) => {
                if (currUserLiveSessionState !== UserLiveSessionStateEnum.NONE.enum) {
                    let errMsg = 'LiveSessionSrv: live session is already active!!!';
                    $log.debug(errMsg);
                    return $q.reject(errMsg);
                }

                return LiveSessionDataGetterSrv.getLiveSessionData(liveSessionGuid)
                    .then((liveSessionData) => {
                        liveSessionData.startTime = this._getRoundTime();
                        liveSessionData.status = LiveSessionStatusEnum.CONFIRMED.enum;
                        return liveSessionData.$save();
                    });
            };

            // make auto call after session starts
            this.makeAutoCall = (receiverId, liveSessionDataGuid) => {
                let isAutoCallAlreadyMade = $window.localStorage.getItem('isAutoCallAlreadyMade');
                isAutoCallAlreadyMade = JSON.parse(isAutoCallAlreadyMade);
                if (isAutoCallAlreadyMade && isAutoCallAlreadyMade[liveSessionDataGuid]) {
                    return;
                }
                CallsSrv.callsStateChanged(receiverId).then((data) => {
                    $window.localStorage.setItem('isAutoCallAlreadyMade', JSON.stringify({[liveSessionDataGuid]: true}));
                    $log.debug('makeAutoCall: success in callsStateChanged, data: ', data);
                }).catch((err) => {
                    $log.error('makeAutoCall: error in callsStateChanged, err: ' + err);
                    CallsErrorSrv.showErrorModal(err);
                });
            };

            // hang call when sesison ends
            this.hangCall = (receiverId) => {
                CallsSrv.isUserInActiveCall().then((isInActiveCall) => {
                    if (isInActiveCall) {
                        CallsSrv.callsStateChanged(receiverId).then((data) => {
                            $log.debug('hangCall: success in callsStateChanged, data: ', data);
                        }).catch((err) => {
                            $log.error('hangCall: error in callsStateChanged, err: ' + err);
                            CallsErrorSrv.showErrorModal(err);
                        });
                    }
                });
            };

            // handel ending live session
            this.endLiveSession = (liveSessionGuid) => {
                let getDataPromMap = {};
                getDataPromMap.liveSessionData = LiveSessionDataGetterSrv.getLiveSessionData(liveSessionGuid);
                getDataPromMap.storage = this._getStorage();
                return $q.all(getDataPromMap).then((data) => {
                    let dataToSave = {};

                    data.liveSessionData.status = LiveSessionStatusEnum.ENDED.enum;
                    data.liveSessionData.endTime = this._getRoundTime();
                    data.liveSessionData.duration = data.liveSessionData.endTime - data.liveSessionData.startTime;
                    dataToSave [data.liveSessionData.$$path] = data.liveSessionData;

                    this._moveToArchive(data.liveSessionData);

                    return data.storage.update(dataToSave);
                });
            };

            // handel updating live session
            this.updateLiveSession = (liveSessionToUpdate) => {
                return this._getStorage().then((data) => {
                    let dataToSave = {
                        [data.liveSessionData.$$path]: liveSessionToUpdate
                    };

                    return data.storage.update(dataToSave);
                });
            };

            // when ending session this fn clears both student and educator active session path
            // and moving the session guid to archive path
            this._moveToArchive = (liveSessionData) => {
                let getDataPromMap = {};
                getDataPromMap.currUid = UserProfileService.getCurrUserId();
                getDataPromMap.currUidLiveSessionRequests = LiveSessionDataGetterSrv.getCurrUserLiveSessionRequests();
                getDataPromMap.storage = this._getStorage();
                return $q.all(getDataPromMap).then((data) => {
                    let dataToSave = {};

                    if (data.currUidLiveSessionRequests) {
                        data.currUidLiveSessionRequests[liveSessionData.guid] = false;
                        let activePath = data.currUidLiveSessionRequests.$$path;
                        dataToSave[activePath] = {};
                        let archivePath = activePath.replace('/active', '/archive');
                        archivePath += '/' + liveSessionData.guid;
                        dataToSave[archivePath] = false;

                        let otherUserLiveSessionRequestPath;
                        if (liveSessionData.studentId !== data.currUid) {
                            otherUserLiveSessionRequestPath = liveSessionData.studentPath;
                        } else {
                            otherUserLiveSessionRequestPath = liveSessionData.teacherPath;
                        }
                        if (otherUserLiveSessionRequestPath) {
                            let otherUserActivePath = otherUserLiveSessionRequestPath + '/active';
                            dataToSave[otherUserActivePath] = {};
                            let otherUserArchivePath = otherUserLiveSessionRequestPath + '/archive';
                            otherUserArchivePath += '/' + liveSessionData.guid;
                            dataToSave[otherUserArchivePath] = false;
                        }

                        return data.storage.update(dataToSave);
                    }
                });
            };

            // insert callback fn to cb array that execute when live session DATA changed
            this.registerToActiveLiveSessionDataChanges = (cb) => {
                registeredCbToActiveLiveSessionDataChanges.push(cb);
                if (activeLiveSessionDataFromAdapter) {
                    cb(activeLiveSessionDataFromAdapter);
                }
            };

            // remove callback fn from cb array
            this.unregisterFromActiveLiveSessionDataChanges = (cb) => {
                registeredCbToActiveLiveSessionDataChanges = this._removeCbFromCbArr(registeredCbToActiveLiveSessionDataChanges, cb);
            };

            // insert callback fn to cb array that execute when live session STATUS changed
            this.registerToCurrUserLiveSessionStateChanges = (cb) => {
                registeredCbToCurrUserLiveSessionStateChange.push(cb);
            };

            // remove callback fn from cb array
            this.unregisterFromCurrUserLiveSessionStateChanges = (cb) => {
                this._cleanRegisteredCbToActiveLiveSessionData();
                registeredCbToCurrUserLiveSessionStateChange = this._removeCbFromCbArr(registeredCbToCurrUserLiveSessionStateChange, cb);
            };

            // get live session data from DB
            this.getActiveLiveSessionData = () => {
                if (!activeLiveSessionDataFromAdapter) {
                    return $q.when(null);
                }

                let dataPromMap = {
                    liveSessionData: LiveSessionDataGetterSrv.getLiveSessionData(activeLiveSessionDataFromAdapter.guid),
                    currUid: UserProfileService.getCurrUserId()
                };
                return $q.all(dataPromMap).then((dataMap) => {
                    let orig$saveFn = dataMap.liveSessionData.$save;
                    dataMap.liveSessionData.$save = () => {
                        dataMap.liveSessionData.updatedBy = dataMap.currUid;
                        return orig$saveFn.apply(dataMap.liveSessionData);
                    };

                    return dataMap.liveSessionData;
                });
            };

            // handel live session STATE changes
            this._userLiveSessionStateChanged = (newUserLiveSessionState, liveSessionData) => {
                if (!newUserLiveSessionState || (currUserLiveSessionState === newUserLiveSessionState)) {
                    return;
                }

                currUserLiveSessionState = newUserLiveSessionState;

                let isStudentState = newUserLiveSessionState === UserLiveSessionStateEnum.STUDENT.enum;
                let isEducatorState = newUserLiveSessionState === UserLiveSessionStateEnum.EDUCATOR.enum;
                if (isStudentState || isEducatorState) {
                    activeLiveSessionDataFromAdapter = liveSessionData;
                    LiveSessionUiSrv.activateLiveSession(newUserLiveSessionState).then(() => {
                        this.endLiveSession(liveSessionData.guid);
                    });
                } else {
                    LiveSessionUiSrv.endLiveSession();
                }

                this._invokeCurrUserLiveSessionStateChangedCb(currUserLiveSessionState);
            };

            // handel live session DATA changes, execute callbacks array
            this._liveSessionDataChanged = (newLiveSessionData) => {
                if (!activeLiveSessionDataFromAdapter || activeLiveSessionDataFromAdapter.guid !== newLiveSessionData.guid) {
                    return;
                }

                activeLiveSessionDataFromAdapter = newLiveSessionData;
                this._checkSessionDuration();
                this._invokeCbs(registeredCbToActiveLiveSessionDataChanges, [activeLiveSessionDataFromAdapter]);
            };

            // when session ends, destroy the check times up session interval
            this._destroyCheckDurationInterval = () => {
                $interval.cancel(liveSessionInterval.interval);
                liveSessionInterval = {};
            };

            // check if lesson times up
            this._checkSessionDuration = () => {
                if (isTeacherApp && activeLiveSessionDataFromAdapter.status === LiveSessionStatusEnum.CONFIRMED.enum) {
                    if (liveSessionInterval.interval) {
                        this._destroyCheckDurationInterval();
                    }
                    LiveSessionDataGetterSrv.getLiveSessionDuration().then((liveSessionDuration) => {
                        if (liveSessionDuration) {
                            SESSION_SETTINGS = liveSessionDuration;
                        }
                        liveSessionInterval.interval = $interval(() => {
                            let liveSessionDuration = (this._getRoundTime() - activeLiveSessionDataFromAdapter.startTime);
                            let EndAlertTime = SESSION_SETTINGS.length + activeLiveSessionDataFromAdapter.extendTime;

                            if (liveSessionDuration >= EndAlertTime && !liveSessionInterval.isSessionAlertShown) {
                                LiveSessionUiSrv.showSessionEndAlertPopup().then(() => {
                                    this.confirmExtendSession();
                                }, function updateIntervalAlertShown() {
                                    liveSessionInterval.isSessionAlertShown = true;
                                    $log.debug('Live session is continued without extend time.');
                                });
                            }
                        }, 60000);
                    });
                }
            };

            // then student confirm the session and the session started
            // update the schedule lesson status to attended (only if dark lunch)
            this._updateLessonsStatusToAttended = (liveSessionData) => {
                return LiveSessionUiSrv.isDarkFeaturesValid(liveSessionData.educatorId, liveSessionData.studentId)
                    .then(isDarkFeaturesValid => {
                        if (isDarkFeaturesValid) {
                            try {
                                scheduledLessonFromAdapter.status = LessonStatusEnum.ATTENDED.enum;
                                if (liveSessionData.backToBackId) {
                                    return ZnkLessonNotesSrv.updateLessonsStatus(liveSessionData.backToBackId, LessonStatusEnum.ATTENDED.enum, true);
                                } else {
                                    return ZnkLessonNotesSrv.updateLessonsStatus(liveSessionData.lessonId, LessonStatusEnum.ATTENDED.enum, false);
                                }
                            }
                            catch (err) {
                                $log.error('_updateLessonsStatusToAttended Error: ', err);
                            }
                        } else {
                            $log.debug('_updateLesson: darkFeatures in OFF');
                        }
                    }).catch(err => $log.error('isDarkFeaturesValid Error: ', err));
            };

            // return now time with round milliseconds
            this._getRoundTime = () => {
                return Math.floor(Date.now() / 1000) * 1000;
            };

            // return the APP global storage
            this._getStorage = () => {
                return InfraConfigSrv.getGlobalStorage();
            };

            this._getLiveSessionInitStatusByInitiator = (initiator) => {
                let initiatorToInitStatusMap = {};
                initiatorToInitStatusMap[UserLiveSessionStateEnum.STUDENT.enum] = LiveSessionStatusEnum.PENDING_EDUCATOR.enum;
                initiatorToInitStatusMap[UserLiveSessionStateEnum.EDUCATOR.enum] = LiveSessionStatusEnum.PENDING_STUDENT.enum;

                return initiatorToInitStatusMap[initiator] || null;
            };

            // check if there is no active session
            this._isLiveSessionAlreadyInitiated = (educatorId, studentId) => {
                return LiveSessionDataGetterSrv.getCurrUserLiveSessionData().then((liveSessionDataMap) => {
                    let isInitiated = false;
                    let liveSessionDataMapKeys = Object.keys(liveSessionDataMap);
                    for (let i in liveSessionDataMapKeys) {
                        let liveSessionDataKey = liveSessionDataMapKeys[i];
                        let liveSessionData = liveSessionDataMap[liveSessionDataKey];

                        let isEnded = liveSessionData.status === LiveSessionStatusEnum.ENDED.enum;
                        if (isEnded) {
                            this.endLiveSession(liveSessionData.guid);
                            continue;
                        }

                        isInitiated = liveSessionData.educatorId === educatorId && liveSessionData.studentId === studentId;
                        if (isInitiated) {
                            break;
                        }
                    }
                    return isInitiated;
                });
            };

            // check if there is no active session and start new session
            // build the live session obj and save it to the db
            // also save the live session guid in both student and educator active session path
            // (those with the event listener on)
            this._initiateLiveSession = (educatorData, studentData, lessonData, initiator) => {
                let errMsg;

                if (angular.isUndefined(educatorData.isTeacher)) {
                    errMsg = 'LiveSessionSrv: isTeacher property was not provided!!!';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                if (currUserLiveSessionState !== UserLiveSessionStateEnum.NONE.enum) {
                    errMsg = 'LiveSessionSrv: live session is already active!!!';
                    $log.debug(errMsg);
                    return $q.reject(errMsg);
                }

                let initLiveSessionStatus = this._getLiveSessionInitStatusByInitiator(initiator);
                if (!initLiveSessionStatus) {
                    errMsg = 'LiveSessionSrv: initiator was not provided';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                return this._isLiveSessionAlreadyInitiated(educatorData.uid, studentData.uid).then((isInitiated) => {
                    if (isInitiated) {
                        let errMsg = 'LiveSessionSrv: live session was already initiated';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    let getDataPromMap = {};

                    getDataPromMap.currUserLiveSessionRequests = LiveSessionDataGetterSrv.getCurrUserLiveSessionRequests();

                    let newLiveSessionGuid = UtilitySrv.general.createGuid();
                    getDataPromMap.newLiveSessionData = LiveSessionDataGetterSrv.getLiveSessionData(newLiveSessionGuid);

                    getDataPromMap.currUid = UserProfileService.getCurrUserId();

                    return $q.all(getDataPromMap).then((data) => {
                        let dataToSave = {};

                        let studentPath = LiveSessionDataGetterSrv.getUserLiveSessionRequestsPath(studentData, newLiveSessionGuid);
                        let educatorPath = LiveSessionDataGetterSrv.getUserLiveSessionRequestsPath(educatorData, newLiveSessionGuid);
                        let newLiveSessionData = {
                            guid: newLiveSessionGuid,
                            educatorId: educatorData.uid,
                            studentId: studentData.uid,
                            status: initLiveSessionStatus,
                            studentPath: studentPath,
                            educatorPath: educatorPath,
                            appName: ENV.firebaseAppScopeName.split('_')[0],
                            expectedSessionEndTime: lessonData.expectedSessionEndTime,
                            educatorStartTime: this._getRoundTime(),
                            startTime: null, // when student confirm the lesson request
                            endTime: null,
                            duration: null,
                            sessionSubject: LiveSessionSubjectSrv.getSessionSubject(lessonData)
                        };

                        if (lessonData.scheduledLesson) {
                            // add lessonSummaryId prop to liveSessionObj to popup lessonNotes/rating in the end of the lesson
                            newLiveSessionData.lessonSummaryId = lessonData.scheduledLesson.lessonSummaryId;
                            newLiveSessionData.lessonId = lessonData.scheduledLesson.id;
                            if (lessonData.scheduledLesson.backToBackId) {
                                newLiveSessionData.backToBackId = lessonData.scheduledLesson.backToBackId;
                            }
                        }

                        angular.extend(data.newLiveSessionData, newLiveSessionData);

                        dataToSave[data.newLiveSessionData.$$path] = data.newLiveSessionData;
                        //educator live session requests object update
                        data.currUserLiveSessionRequests[newLiveSessionGuid] = true;
                        let educatorLiveSessionDataGuidPath = educatorPath + '/active';
                        dataToSave[educatorLiveSessionDataGuidPath] = data.currUserLiveSessionRequests;
                        //student live session requests object update
                        let studentLiveSessionDataGuidPath = studentPath + '/active';
                        dataToSave[studentLiveSessionDataGuidPath] = data.currUserLiveSessionRequests;

                        return this._getStorage().then((StudentStorage) => {
                            return StudentStorage.update(dataToSave);
                        });
                    });

                });
            };

            // clear the live session data adapter
            this._cleanRegisteredCbToActiveLiveSessionData = () => {
                activeLiveSessionDataFromAdapter = null;
                registeredCbToActiveLiveSessionDataChanges = [];
            };

            // execute when live session STATUS changed
            this._invokeCurrUserLiveSessionStateChangedCb = () => {
                this._invokeCbs(registeredCbToCurrUserLiveSessionStateChange, [currUserLiveSessionState]);
            };

            // remove fn from array
            this._removeCbFromCbArr = (cbArr, cb) => {
                return cbArr.filter((iterationCb) => {
                    return iterationCb !== cb;
                });
            };

            // execute callbacks array
            this._invokeCbs = (cbArr, args) => {
                cbArr.forEach((cb) => {
                    cb.apply(null, args);
                });
            };

            // educator can extend the session with another 15 min when the times up alert poped
            this.confirmExtendSession = () => {
                LiveSessionDataGetterSrv.getLiveSessionData(activeLiveSessionDataFromAdapter.guid)
                    .then((liveSessionData) => {
                        liveSessionData.extendTime += SESSION_SETTINGS.extendTime;
                        return liveSessionData.$save();
                    }).then(() => {
                    let extendTimeInMin = SESSION_SETTINGS.extendTime / 60000; // convert to minutes
                    $log.debug('confirmExtendSession: Live session is extend by ' + extendTimeInMin + ' minutes.');
                }).catch(() => {
                    $log.debug('confirmExtendSession: Failed to save extend live session in guid: ' + activeLiveSessionDataFromAdapter.guid);
                });
            };
        }
    );
})(angular);
