(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').service('LiveSessionSrv',
        function (UserProfileService, InfraConfigSrv, $q, UtilitySrv, LiveSessionDataGetterSrv, LiveSessionStatusEnum,
                  ENV, $log, UserLiveSessionStateEnum, LiveSessionUiSrv, $interval, CallsSrv, CallsErrorSrv,
                  ZnkLessonNotesSrv, LessonStatusEnum, LessonNotesStatusEnum, UserTypeContextEnum) {
            'ngInject';

            let _this = this;

            let SESSION_DURATION =  {
                length: ENV.liveSession.sessionLength,
                extendTime: ENV.liveSession.sessionExtendTime,
                endAlertTime: ENV.liveSession.sessionEndAlertTime
            };

            let activeLiveSessionDataFromAdapter = null;
            let currUserLiveSessionState = UserLiveSessionStateEnum.NONE.enum;
            let registeredCbToActiveLiveSessionDataChanges = [];
            let registeredCbToCurrUserLiveSessionStateChange = [];
            let liveSessionInterval = {};
            let isTeacherApp = (ENV.appContext.toLowerCase()) === 'dashboard';

            this.startLiveSession = function (studentData, lessonData) {
                return UserProfileService.getCurrUserId().then(function (currUserId) {
                    let educatorData = {
                        uid: currUserId,
                        isTeacher: isTeacherApp

                    };

                    return _initiateLiveSession(educatorData, studentData, lessonData, UserLiveSessionStateEnum.EDUCATOR.enum);
                });
            };

            this.confirmLiveSession = function (liveSessionGuid) {
                if (currUserLiveSessionState !== UserLiveSessionStateEnum.NONE.enum) {
                    let errMsg = 'LiveSessionSrv: live session is already active!!!';
                    $log.debug(errMsg);
                    return $q.reject(errMsg);
                }

                return LiveSessionDataGetterSrv.getLiveSessionData(liveSessionGuid).then(function (liveSessionData) {
                    liveSessionData.status = LiveSessionStatusEnum.CONFIRMED.enum;
                    return liveSessionData.$save();
                });
            };

            this.makeAutoCall = function (receiverId) {
                CallsSrv.callsStateChanged(receiverId).then(function (data) {
                    $log.debug('makeAutoCall: success in callsStateChanged, data: ', data);
                }).catch(function (err) {
                    $log.error('makeAutoCall: error in callsStateChanged, err: ' + err);
                    CallsErrorSrv.showErrorModal(err);
                });
            };

            this.hangCall = function (receiverId) {
                CallsSrv.isUserInActiveCall().then(function (isInActiveCall) {
                    if (isInActiveCall) {
                        CallsSrv.callsStateChanged(receiverId).then(function (data) {
                            $log.debug('hangCall: success in callsStateChanged, data: ', data);
                        }).catch(function (err) {
                            $log.error('hangCall: error in callsStateChanged, err: ' + err);
                            CallsErrorSrv.showErrorModal(err);
                        });
                    }
                });
            };

            this.endLiveSession = function (liveSessionGuid) {
                let getDataPromMap = {};
                getDataPromMap.liveSessionData = LiveSessionDataGetterSrv.getLiveSessionData(liveSessionGuid);
                getDataPromMap.storage = _getStorage();
                return $q.all(getDataPromMap).then(function (data) {
                    let dataToSave = {};

                    data.liveSessionData.status = LiveSessionStatusEnum.ENDED.enum;
                    data.liveSessionData.endTime = _getRoundTime();
                    data.liveSessionData.duration = data.liveSessionData.endTime - data.liveSessionData.startTime;
                    dataToSave [data.liveSessionData.$$path] = data.liveSessionData;

                    _this._moveToArchive(data.liveSessionData);

                    return data.storage.update(dataToSave).then(() => {
                        UserProfileService.getProfile().then(userProfile => {
                            if (userProfile && userProfile.darkFeatures && userProfile.darkFeatures.myZinkerz) {
                                $log.debug('darkFeatures in ON');
                                let userContext;
                                if (data.liveSessionData.lessonId) {
                                    if (userProfile.adminInfo && userProfile.adminInfo.permissions && userProfile.adminInfo.permissions.isAdmin) {
                                        userContext = UserTypeContextEnum.ADMIN.enum;
                                    } else {
                                        userContext = isTeacherApp ? UserTypeContextEnum.EDUCATOR.enum : UserTypeContextEnum.STUDENT.enum;
                                    }
                                    ZnkLessonNotesSrv.openLessonNotesPopup(data.liveSessionData, userContext);
                                }

                            } else {
                                $log.debug('darkFeatures in OFF');
                            }
                        });
                    });
                });
            };

            this.updateLiveSession = function (liveSessionToUpdate) {
                return _getStorage().then(function (data) {
                    let dataToSave = {
                        [data.liveSessionData.$$path]: liveSessionToUpdate
                    };

                    return data.storage.update(dataToSave);
                });
            };

            this._moveToArchive = function (liveSessionData) {
                let getDataPromMap = {};
                getDataPromMap.currUid = UserProfileService.getCurrUserId();
                getDataPromMap.currUidLiveSessionRequests = LiveSessionDataGetterSrv.getCurrUserLiveSessionRequests();
                getDataPromMap.storage = _getStorage();
                return $q.all(getDataPromMap).then(function (data) {
                    let dataToSave = {};

                    if (data.currUidLiveSessionRequests){
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
                        if (otherUserLiveSessionRequestPath){
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

            this.registerToActiveLiveSessionDataChanges = function (cb) {
                registeredCbToActiveLiveSessionDataChanges.push(cb);
                if (activeLiveSessionDataFromAdapter) {
                    cb(activeLiveSessionDataFromAdapter);
                }
            };

            this.unregisterFromActiveLiveSessionDataChanges = function(cb){
                registeredCbToActiveLiveSessionDataChanges =_removeCbFromCbArr(registeredCbToActiveLiveSessionDataChanges, cb);
            };

            this.registerToCurrUserLiveSessionStateChanges = function (cb) {
                registeredCbToCurrUserLiveSessionStateChange.push(cb);
            };

            this.unregisterFromCurrUserLiveSessionStateChanges = function (cb) {
                _cleanRegisteredCbToActiveLiveSessionData();
                registeredCbToCurrUserLiveSessionStateChange = _removeCbFromCbArr(registeredCbToCurrUserLiveSessionStateChange,cb);
            };

            this.getActiveLiveSessionData = function () {
                if (!activeLiveSessionDataFromAdapter) {
                    return $q.when(null);
                }

                let dataPromMap = {
                    liveSessionData: LiveSessionDataGetterSrv.getLiveSessionData(activeLiveSessionDataFromAdapter.guid),
                    currUid: UserProfileService.getCurrUserId()
                };
                return $q.all(dataPromMap).then(function(dataMap){
                    let orig$saveFn = dataMap.liveSessionData.$save;
                    dataMap.liveSessionData.$save = function () {
                        dataMap.liveSessionData.updatedBy = dataMap.currUid;
                        return orig$saveFn.apply(dataMap.liveSessionData);
                    };

                    return dataMap.liveSessionData;
                });
            };

            this._userLiveSessionStateChanged = function (newUserLiveSessionState, liveSessionData) {
                if (!newUserLiveSessionState || (currUserLiveSessionState === newUserLiveSessionState)) {
                    return;
                }

                currUserLiveSessionState = newUserLiveSessionState;

                let isStudentState = newUserLiveSessionState === UserLiveSessionStateEnum.STUDENT.enum;
                let isEducatorState = newUserLiveSessionState === UserLiveSessionStateEnum.EDUCATOR.enum;
                if (isStudentState || isEducatorState) {
                    activeLiveSessionDataFromAdapter = liveSessionData;
                    LiveSessionUiSrv.activateLiveSession(newUserLiveSessionState).then(function () {
                        _this.endLiveSession(liveSessionData.guid);
                    });
                } else {
                    LiveSessionUiSrv.endLiveSession();
                }

                _invokeCurrUserLiveSessionStateChangedCb(currUserLiveSessionState);
            };

            this._liveSessionDataChanged = function (newLiveSessionData) {
                if (!activeLiveSessionDataFromAdapter || activeLiveSessionDataFromAdapter.guid !== newLiveSessionData.guid) {
                    return;
                }

                activeLiveSessionDataFromAdapter = newLiveSessionData;
                _checkSessionDuration();
                _invokeCbs(registeredCbToActiveLiveSessionDataChanges, [activeLiveSessionDataFromAdapter]);
            };

            this._destroyCheckDurationInterval = function() {
                $interval.cancel(liveSessionInterval.interval);
                liveSessionInterval = {};
            };


            function _getRoundTime() {
                return Math.floor(Date.now() / 1000) * 1000;
            }

            function _getStorage() {
                return InfraConfigSrv.getGlobalStorage();
            }

            function _getLiveSessionInitStatusByInitiator(initiator) {
                let initiatorToInitStatusMap = {};
                initiatorToInitStatusMap[UserLiveSessionStateEnum.STUDENT.enum] = LiveSessionStatusEnum.PENDING_EDUCATOR.enum;
                initiatorToInitStatusMap[UserLiveSessionStateEnum.EDUCATOR.enum] = LiveSessionStatusEnum.PENDING_STUDENT.enum;

                return initiatorToInitStatusMap[initiator] || null;
            }

            function _isLiveSessionAlreadyInitiated(educatorId, studentId) {
                return LiveSessionDataGetterSrv.getCurrUserLiveSessionData().then(function (liveSessionDataMap) {
                    let isInitiated = false;
                    let liveSessionDataMapKeys = Object.keys(liveSessionDataMap);
                    for (let i in liveSessionDataMapKeys) {
                        let liveSessionDataKey = liveSessionDataMapKeys[i];
                        let liveSessionData = liveSessionDataMap[liveSessionDataKey];

                        let isEnded = liveSessionData.status === LiveSessionStatusEnum.ENDED.enum;
                        if (isEnded) {
                            _this.endLiveSession(liveSessionData.guid);
                            continue;
                        }

                        isInitiated = liveSessionData.educatorId === educatorId && liveSessionData.studentId === studentId;
                        if (isInitiated) {
                            break;
                        }
                    }
                    return isInitiated;
                });
            }

            function _initiateLiveSession(educatorData, studentData, lessonData, initiator) {
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

                let initLiveSessionStatus = _getLiveSessionInitStatusByInitiator(initiator);
                if (!initLiveSessionStatus) {
                    errMsg = 'LiveSessionSrv: initiator was not provided';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                return _isLiveSessionAlreadyInitiated(educatorData.uid, studentData.uid).then(function (isInitiated) {
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

                    return $q.all(getDataPromMap).then(function (data) {
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
                            extendTime: 0,
                            startTime:  _getRoundTime(),
                            endTime: null,
                            duration: null,
                            sessionSubject: lessonData.topicId,
                            lessonId: lessonData.id
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

                        try {
                            if (lessonData.id) {
                                _updateLesson(lessonData);
                            }
                        } catch (err) {
                            $log.error('_initiateLiveSession: updateLesson failed. Error: ', err);
                        }

                        return _getStorage().then(function (StudentStorage) {
                            return StudentStorage.update(dataToSave).then(() => {
                                _this.makeAutoCall(newLiveSessionData.studentId);
                            });
                        });
                    });

                });
            }

            function _updateLesson(lesson) {
                lesson.status = LessonStatusEnum.ATTENDED.enum;
                lesson.lessonNotes = lesson.lessonNotes || {};
                lesson.lessonNotes.status = LessonNotesStatusEnum.PENDING_NOTES.enum;

                return ZnkLessonNotesSrv.updateLesson(lesson).then(lesson => {
                    $log.debug('_updateLesson: Lesson: ', lesson);
                });
            }

            function _cleanRegisteredCbToActiveLiveSessionData() {
                activeLiveSessionDataFromAdapter = null;
                registeredCbToActiveLiveSessionDataChanges = [];
            }

            function _invokeCurrUserLiveSessionStateChangedCb() {
                _invokeCbs(registeredCbToCurrUserLiveSessionStateChange, [currUserLiveSessionState]);
            }

            function _removeCbFromCbArr(cbArr, cb){
                return cbArr.filter(function (iterationCb) {
                    return iterationCb !== cb;
                });
            }

            function _invokeCbs(cbArr, args){
                cbArr.forEach(function(cb){
                    cb.apply(null, args);
                });
            }

            function _checkSessionDuration() {
                if (isTeacherApp && activeLiveSessionDataFromAdapter.status === LiveSessionStatusEnum.CONFIRMED.enum) {
                    if (liveSessionInterval.interval){
                        _this._destroyCheckDurationInterval();
                    }
                    LiveSessionDataGetterSrv.getLiveSessionDuration().then(function (liveSessionDuration) {
                        if (liveSessionDuration) {
                            SESSION_DURATION = liveSessionDuration;
                        }
                        liveSessionInterval.interval = $interval(function () {
                            let liveSessionDuration = (_getRoundTime() - activeLiveSessionDataFromAdapter.startTime);
                            let maxSessionDuration = SESSION_DURATION.length + activeLiveSessionDataFromAdapter.extendTime;
                            let EndAlertTime = maxSessionDuration - SESSION_DURATION.endAlertTime;

                            if (liveSessionDuration >= maxSessionDuration) {
                                _this.endLiveSession(activeLiveSessionDataFromAdapter.guid);
                            } else if (liveSessionDuration >= EndAlertTime && !liveSessionInterval.isSessionAlertShown) {
                                LiveSessionUiSrv.showSessionEndAlertPopup().then(function () {
                                    confirmExtendSession();
                                }, function updateIntervalAlertShown() {
                                    liveSessionInterval.isSessionAlertShown = true;
                                    $log.debug('Live session is continued without extend time.');
                                });
                            }
                        }, 60000);
                    });
                }
            }

            function confirmExtendSession() {
                LiveSessionDataGetterSrv.getLiveSessionData(activeLiveSessionDataFromAdapter.guid).then(function (liveSessionData) {
                    liveSessionData.extendTime += SESSION_DURATION.extendTime;
                    return liveSessionData.$save();
                }).then(function () {
                    let extendTimeInMin = SESSION_DURATION.extendTime / 60000; // convert to minutes
                    $log.debug('confirmExtendSession: Live session is extend by ' + extendTimeInMin + ' minutes.');
                }).catch(function () {
                    $log.debug('confirmExtendSession: Failed to save extend live session in guid: ' + activeLiveSessionDataFromAdapter.guid);
                });
            }
        }
    );
})(angular);
