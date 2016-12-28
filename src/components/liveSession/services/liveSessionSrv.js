(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').service('LiveSessionSrv',
        function (UserProfileService, InfraConfigSrv, $q, UtilitySrv, LiveSessionDataGetterSrv, LiveSessionStatusEnum,
                  ENV, $log, UserLiveSessionStateEnum, LiveSessionUiSrv, $interval) {
            'ngInject';

            var _this = this;

            var activeLiveSessionDataFromAdapter = null;
            var currUserLiveSessionState = UserLiveSessionStateEnum.NONE.enum;
            var registeredCbToActiveLiveSessionDataChanges = [];
            var registeredCbToCurrUserLiveSessionStateChange = [];
            var liveSessionInterval = {};
            var isTeacherApp = (ENV.appContext.toLowerCase()) === 'dashboard';

            this.startLiveSession = function (studentData, sessionSubject) {
                return UserProfileService.getCurrUserId().then(function (currUserId) {
                    var educatorData = {
                        uid: currUserId,
                        isTeacher: isTeacherApp,
                        sessionSubject: sessionSubject
                    };
                    return _initiateLiveSession(educatorData, studentData, UserLiveSessionStateEnum.EDUCATOR.enum);
                });
            };

            this.confirmLiveSession = function (liveSessionGuid) {
                if (currUserLiveSessionState !== UserLiveSessionStateEnum.NONE.enum) {
                    var errMsg = 'LiveSessionSrv: live session is already active!!!';
                    $log.debug(errMsg);
                    return $q.reject(errMsg);
                }

                return LiveSessionDataGetterSrv.getLiveSessionData(liveSessionGuid).then(function (liveSessionData) {
                    liveSessionData.status = LiveSessionStatusEnum.CONFIRMED.enum;
                    return liveSessionData.$save();
                });
            };

            this.endLiveSession = function (liveSessionGuid) {
                var getDataPromMap = {};
                getDataPromMap.liveSessionData = LiveSessionDataGetterSrv.getLiveSessionData(liveSessionGuid);
                getDataPromMap.currUid = UserProfileService.getCurrUserId();
                getDataPromMap.currUidLiveSessionRequests = LiveSessionDataGetterSrv.getCurrUserLiveSessionRequests();
                getDataPromMap.storage = _getStorage();
                return $q.all(getDataPromMap).then(function (data) {
                    var dataToSave = {};

                    data.liveSessionData.status = LiveSessionStatusEnum.ENDED.enum;
                    data.liveSessionData.endTime = _getRoundTime();
                    data.liveSessionData.duration = data.liveSessionData.endTime - data.liveSessionData.startTime;
                    dataToSave [data.liveSessionData.$$path] = data.liveSessionData;
                    _destroyCheckDurationInterval();

                    data.currUidLiveSessionRequests[data.liveSessionData.guid] = false;
                    var activePath = data.currUidLiveSessionRequests.$$path;
                    dataToSave[activePath] = {};
                    var archivePath = activePath.replace('/active', '/archive');
                    archivePath += '/' + liveSessionGuid;
                    dataToSave[archivePath] = false;

                    var otherUserLiveSessionRequestPath;
                    if (data.liveSessionData.studentId !== data.currUid) {
                        otherUserLiveSessionRequestPath = data.liveSessionData.studentPath;
                    } else {
                        otherUserLiveSessionRequestPath = data.liveSessionData.teacherPath;
                    }
                    var otherUserActivePath = otherUserLiveSessionRequestPath + '/active';
                    dataToSave[otherUserActivePath] = {};
                    var otherUserArchivePath = otherUserLiveSessionRequestPath + '/archive';
                    otherUserArchivePath += '/' + liveSessionGuid;
                    dataToSave[otherUserArchivePath] = false;

                    return data.storage.update(dataToSave);
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
                cb(currUserLiveSessionState);
            };

            this.unregisterFromCurrUserLiveSessionStateChanges = function (cb) {
                _cleanRegisteredCbToActiveLiveSessionData();
                registeredCbToCurrUserLiveSessionStateChange = _removeCbFromCbArr(registeredCbToCurrUserLiveSessionStateChange,cb);
            };

            this.getActiveLiveSessionData = function () {
                if (!activeLiveSessionDataFromAdapter) {
                    return $q.when(null);
                }

                var dataPromMap = {
                    liveSessionData: LiveSessionDataGetterSrv.getLiveSessionData(activeLiveSessionDataFromAdapter.guid),
                    currUid: UserProfileService.getCurrUserId()
                };
                return $q.all(dataPromMap).then(function(dataMap){
                    var orig$saveFn = dataMap.liveSessionData.$save;
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

                var isStudentState = newUserLiveSessionState === UserLiveSessionStateEnum.STUDENT.enum;
                var isEducatorState = newUserLiveSessionState === UserLiveSessionStateEnum.EDUCATOR.enum;
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
                _checkSessionDuration(newLiveSessionData);
                _invokeCbs(registeredCbToActiveLiveSessionDataChanges, [activeLiveSessionDataFromAdapter]);
            };


            function _getRoundTime() {
                return Math.floor(Date.now() / 1000) * 1000;
            }

            function _getStorage() {
                return InfraConfigSrv.getGlobalStorage();
            }

            function _getLiveSessionInitStatusByInitiator(initiator) {
                var initiatorToInitStatusMap = {};
                initiatorToInitStatusMap[UserLiveSessionStateEnum.STUDENT.enum] = LiveSessionStatusEnum.PENDING_EDUCATOR.enum;
                initiatorToInitStatusMap[UserLiveSessionStateEnum.EDUCATOR.enum] = LiveSessionStatusEnum.PENDING_STUDENT.enum;

                return initiatorToInitStatusMap[initiator] || null;
            }

            function _isLiveSessionAlreadyInitiated(educatorId, studentId) {
                return LiveSessionDataGetterSrv.getCurrUserLiveSessionData().then(function (liveSessionDataMap) {
                    var isInitiated = false;
                    var liveSessionDataMapKeys = Object.keys(liveSessionDataMap);
                    for (var i in liveSessionDataMapKeys) {
                        var liveSessionDataKey = liveSessionDataMapKeys[i];
                        var liveSessionData = liveSessionDataMap[liveSessionDataKey];

                        var isEnded = liveSessionData.status === LiveSessionStatusEnum.ENDED.enum;
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

            function _initiateLiveSession(educatorData, studentData, initiator) {
                var errMsg;

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

                var initLiveSessionStatus = _getLiveSessionInitStatusByInitiator(initiator);
                if (!initLiveSessionStatus) {
                    errMsg = 'LiveSessionSrv: initiator was not provided';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                return _isLiveSessionAlreadyInitiated(educatorData.uid, studentData.uid).then(function (isInitiated) {
                    if (isInitiated) {
                        var errMsg = 'LiveSessionSrv: live session was already initiated';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    var getDataPromMap = {};

                    getDataPromMap.currUserLiveSessionRequests = LiveSessionDataGetterSrv.getCurrUserLiveSessionRequests();

                    var newLiveSessionGuid = UtilitySrv.general.createGuid();
                    getDataPromMap.newLiveSessionData = LiveSessionDataGetterSrv.getLiveSessionData(newLiveSessionGuid);

                    getDataPromMap.currUid = UserProfileService.getCurrUserId();

                    return $q.all(getDataPromMap).then(function (data) {
                        var dataToSave = {};

                        var startTime = _getRoundTime();
                        var studentPath = LiveSessionDataGetterSrv.getUserLiveSessionRequestsPath(studentData, newLiveSessionGuid);
                        var educatorPath = LiveSessionDataGetterSrv.getUserLiveSessionRequestsPath(educatorData, newLiveSessionGuid);
                        var newLiveSessionData = {
                            guid: newLiveSessionGuid,
                            educatorId: educatorData.uid,
                            studentId: studentData.uid,
                            status: initLiveSessionStatus,
                            studentPath: studentPath,
                            educatorPath: educatorPath,
                            appName: ENV.firebaseAppScopeName.split('_')[0],
                            extendTime: 0,
                            startTime: startTime,
                            endTime: null,
                            duration: null,
                            sessionSubject: educatorData.sessionSubject.id
                        };
                        _checkSessionDuration(newLiveSessionData);
                        angular.extend(data.newLiveSessionData, newLiveSessionData);

                        dataToSave[data.newLiveSessionData.$$path] = data.newLiveSessionData;
                        //educator live session requests object update
                        data.currUserLiveSessionRequests[newLiveSessionGuid] = true;
                        var educatorLiveSessionDataGuidPath = educatorPath + '/active';
                        dataToSave[educatorLiveSessionDataGuidPath] = data.currUserLiveSessionRequests;
                        //student live session requests object update
                        var studentLiveSessionDataGuidPath = studentPath + '/active';
                        dataToSave[studentLiveSessionDataGuidPath] = data.currUserLiveSessionRequests;

                        return _getStorage().then(function (StudentStorage) {
                            return StudentStorage.update(dataToSave);
                        });
                    });

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

            function _checkSessionDuration(liveSessionData) {
                if (isTeacherApp && liveSessionData.status === LiveSessionStatusEnum.CONFIRMED.enum) {
                    liveSessionInterval.interval = $interval(function () {
                        var liveSessionDuration = (_getRoundTime() - liveSessionData.startTime)  / 60000; // convert to minutes
                        var extendTimeMin = liveSessionData.extendTime / 60000;
                        var maxSessionDuration = ENV.liveSession.sessionLength + extendTimeMin;
                        var sessionTimeWithExtension = liveSessionDuration + extendTimeMin;
                        var EndAlertTime = maxSessionDuration - ENV.liveSession.sessionEndAlertTime;

                        if (sessionTimeWithExtension >= maxSessionDuration) {
                            _this.endLiveSession(liveSessionData.guid);
                        } else if (sessionTimeWithExtension >= EndAlertTime && !liveSessionInterval.isSessionAlertShown) {
                            LiveSessionUiSrv.showSessionEndAlertPopup().then(function () {
                                confirmExtendSession(liveSessionData);
                            }, function updateIntervalAlertShown() {
                                liveSessionInterval.isSessionAlertShown = true;
                                $log.debug('Live session is continued without extend time.');
                            });
                        }
                    }, 60000);
                }
            }

            function confirmExtendSession(liveSessionData) {
                liveSessionData.extendTime += ENV.liveSession.sessionExtendTime * 60000;  // minutes to milliseconds
                _this._liveSessionDataChanged(liveSessionData);
                $log.debug('Live session is extend by ' + ENV.liveSession.sessionExtendTime + ' minutes.');
            }

            function _destroyCheckDurationInterval() {
                $interval.cancel(liveSessionInterval.interval);
                liveSessionInterval = {};
            }
        }
    );
})(angular);