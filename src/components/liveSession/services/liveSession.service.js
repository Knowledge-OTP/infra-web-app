(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').service('LiveSessionSrv',
        function (UserProfileService, InfraConfigSrv, $q, UtilitySrv, LiveSessionDataGetterSrv, LiveSessionStatusEnum,
                  ENV, $log, UserLiveSessionStateEnum, LiveSessionUiSrv, $interval, CallsSrv, CallsErrorSrv,
                  ZnkLessonNotesSrv, LessonStatusEnum, LessonNotesStatusEnum, $window, LiveSessionSubjectSrv) {
            'ngInject';

            let SESSION_DURATION = {
                length: ENV.liveSession.sessionLength,
                extendTime: ENV.liveSession.sessionExtendTime,
            };

            let activeLiveSessionDataFromAdapter = null;
            let scheduledLessonFromAdapter = null;
            let currUserLiveSessionState = UserLiveSessionStateEnum.NONE.enum;
            let registeredCbToActiveLiveSessionDataChanges = [];
            let registeredCbToCurrUserLiveSessionStateChange = [];
            let liveSessionInterval = {};
            let isTeacherApp = (ENV.appContext.toLowerCase()) === 'dashboard';

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

            this.confirmLiveSession = (liveSessionGuid) => {
                if (currUserLiveSessionState !== UserLiveSessionStateEnum.NONE.enum) {
                    let errMsg = 'LiveSessionSrv: live session is already active!!!';
                    $log.debug(errMsg);
                    return $q.reject(errMsg);
                }

                return LiveSessionDataGetterSrv.getLiveSessionData(liveSessionGuid).then((liveSessionData) => {
                    liveSessionData.startTime = this._getRoundTime();
                    liveSessionData.status = LiveSessionStatusEnum.CONFIRMED.enum;
                    // update lesson in documentDB/cosmosDB
                    this._updateLesson(liveSessionData);
                    return liveSessionData.$save();
                });
            };

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

                    // update lesson in documentDB/cosmosDB
                    this._updateLesson(data.liveSessionData);

                    return data.storage.update(dataToSave);

                });
            };

            this.updateLiveSession = (liveSessionToUpdate) => {
                return this._getStorage().then((data) => {
                    let dataToSave = {
                        [data.liveSessionData.$$path]: liveSessionToUpdate
                    };

                    return data.storage.update(dataToSave);
                });
            };

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

            this.registerToActiveLiveSessionDataChanges = (cb) => {
                registeredCbToActiveLiveSessionDataChanges.push(cb);
                if (activeLiveSessionDataFromAdapter) {
                    cb(activeLiveSessionDataFromAdapter);
                }
            };

            this.unregisterFromActiveLiveSessionDataChanges = (cb) => {
                registeredCbToActiveLiveSessionDataChanges = this._removeCbFromCbArr(registeredCbToActiveLiveSessionDataChanges, cb);
            };

            this.registerToCurrUserLiveSessionStateChanges = (cb) => {
                registeredCbToCurrUserLiveSessionStateChange.push(cb);
            };

            this.unregisterFromCurrUserLiveSessionStateChanges = (cb) => {
                this._cleanRegisteredCbToActiveLiveSessionData();
                registeredCbToCurrUserLiveSessionStateChange = this._removeCbFromCbArr(registeredCbToCurrUserLiveSessionStateChange, cb);
            };

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

            this._liveSessionDataChanged = (newLiveSessionData) => {
                if (!activeLiveSessionDataFromAdapter || activeLiveSessionDataFromAdapter.guid !== newLiveSessionData.guid) {
                    return;
                }

                activeLiveSessionDataFromAdapter = newLiveSessionData;
                this._checkSessionDuration();
                this._invokeCbs(registeredCbToActiveLiveSessionDataChanges, [activeLiveSessionDataFromAdapter]);
            };

            this._destroyCheckDurationInterval = () => {
                $interval.cancel(liveSessionInterval.interval);
                liveSessionInterval = {};
            };

            this._checkSessionDuration = () => {
                if (isTeacherApp && activeLiveSessionDataFromAdapter.status === LiveSessionStatusEnum.CONFIRMED.enum) {
                    if (liveSessionInterval.interval) {
                        this._destroyCheckDurationInterval();
                    }
                    LiveSessionDataGetterSrv.getLiveSessionDuration().then((liveSessionDuration) => {
                        if (liveSessionDuration) {
                            SESSION_DURATION = liveSessionDuration;
                        }
                        liveSessionInterval.interval = $interval(() => {
                            let liveSessionDuration = (this._getRoundTime() - activeLiveSessionDataFromAdapter.startTime);
                            let EndAlertTime = SESSION_DURATION.length + activeLiveSessionDataFromAdapter.extendTime;

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

            this._updateLesson = (liveSessionData) => {
                return LiveSessionUiSrv.isDarkFeaturesValid(liveSessionData.educatorId, liveSessionData.studentId)
                    .then(isDarkFeaturesValid => {
                        if (isDarkFeaturesValid) {
                            let updatePromArr = [];
                            if (liveSessionData.backToBackId) {
                                // update all backToBack lessons
                                ZnkLessonNotesSrv.getLessonsByBackToBackId(liveSessionData.backToBackId)
                                    .then(backToBackLessonsArr => {
                                        backToBackLessonsArr.forEach(b2bLesson => {
                                            updatePromArr.push(this.updateSingleLesson(b2bLesson, liveSessionData));
                                        });
                                    });
                            } else {
                                ZnkLessonNotesSrv.getLessonById(liveSessionData.lessonId).then(lesson => {
                                    updatePromArr.push(this.updateSingleLesson(lesson, liveSessionData));
                                });
                            }
                            return Promise.all(updatePromArr)
                                .then(updatedLessons => $log.debug('_updateLesson: update lessons for startTime & status. updatedLessons: ', updatedLessons))
                                .catch (err => $log.error('_updateLesson: updateLesson failed. Error: ', err));

                        } else {
                            $log.debug('_updateLesson: darkFeatures in OFF');
                        }
                    });
            };

            this.updateSingleLesson = (lesson, liveSessionData) => {
                // update lesson startTime, endTime and status
                lesson.lessonSummary = lesson.lessonSummary || {};
                lesson.lessonSummary.startTime = lesson.lessonSummary.startTime ? lesson.lessonSummary.startTime :
                    liveSessionData.startTime ? liveSessionData.startTime: null;
                lesson.lessonSummary.endTime = lesson.lessonSummary.endTime ? lesson.lessonSummary.endTime :
                    liveSessionData.endTime ? liveSessionData.endTime : null;
                lesson.status = lesson.status === LessonStatusEnum.SCHEDULED.enum ?
                    LessonStatusEnum.ATTENDED.enum : lesson.status;
                lesson.lessonSummary.lessonNotes = lesson.lessonSummary.lessonNotes || {};
                lesson.lessonSummary.lessonNotes.status = lesson.lessonSummary.lessonNotes.status || LessonNotesStatusEnum.PENDING_NOTES.enum;
                lesson.lessonSummary.liveSessions = lesson.lessonSummary.liveSessions || [];
                lesson.lessonSummary.liveSessions.push(liveSessionData.guid);
                lesson.lessonSummary.liveSessions = UtilitySrv.array.removeDuplicates(lesson.lessonSummary.liveSessions);
                return ZnkLessonNotesSrv.updateLesson(lesson);
            };

            this._getRoundTime = () => {
                return Math.floor(Date.now() / 1000) * 1000;
            };

            this._getStorage = () => {
                return InfraConfigSrv.getGlobalStorage();
            };

            this._getLiveSessionInitStatusByInitiator = (initiator) => {
                let initiatorToInitStatusMap = {};
                initiatorToInitStatusMap[UserLiveSessionStateEnum.STUDENT.enum] = LiveSessionStatusEnum.PENDING_EDUCATOR.enum;
                initiatorToInitStatusMap[UserLiveSessionStateEnum.EDUCATOR.enum] = LiveSessionStatusEnum.PENDING_STUDENT.enum;

                return initiatorToInitStatusMap[initiator] || null;
            };

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
                            educatorStartTime:  this._getRoundTime(),
                            startTime: null, // when student confirm the lesson request
                            endTime: null,
                            duration: null,
                            sessionSubject: LiveSessionSubjectSrv.getSessionSubject(lessonData),
                            lessonId: lessonData.scheduledLesson ? lessonData.scheduledLesson.id : null,
                            backToBackId: lessonData.scheduledLesson ? lessonData.scheduledLesson.backToBackId : null
                        };

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

            this._cleanRegisteredCbToActiveLiveSessionData = () => {
                activeLiveSessionDataFromAdapter = null;
                registeredCbToActiveLiveSessionDataChanges = [];
            };

            this._invokeCurrUserLiveSessionStateChangedCb = () => {
                this._invokeCbs(registeredCbToCurrUserLiveSessionStateChange, [currUserLiveSessionState]);
            };

            this._removeCbFromCbArr = (cbArr, cb) => {
                return cbArr.filter((iterationCb) => {
                    return iterationCb !== cb;
                });
            };

            this._invokeCbs = (cbArr, args) => {
                cbArr.forEach((cb) => {
                    cb.apply(null, args);
                });
            };

            this.confirmExtendSession = () => {
                LiveSessionDataGetterSrv.getLiveSessionData(activeLiveSessionDataFromAdapter.guid)
                    .then((liveSessionData) => {
                    liveSessionData.extendTime += SESSION_DURATION.extendTime;
                    return liveSessionData.$save();
                }).then(() => {
                    let extendTimeInMin = SESSION_DURATION.extendTime / 60000; // convert to minutes
                    $log.debug('confirmExtendSession: Live session is extend by ' + extendTimeInMin + ' minutes.');
                }).catch(() => {
                    $log.debug('confirmExtendSession: Failed to save extend live session in guid: ' + activeLiveSessionDataFromAdapter.guid);
                });
            };
        }
    );
})(angular);
