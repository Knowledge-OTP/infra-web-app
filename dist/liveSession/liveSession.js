(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession',
        [
            'ngMaterial',
            'znk.infra.znkSessionData',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra.auth',
            'znk.infra.userContext',
            'znk.infra.user',
            'znk.infra.utility',
            'znk.infra.analytics',
            'znk.infra.general',
            'znk.infra.svgIcon',
            'znk.infra-web-app.diagnostic',
            'znk.infra-web-app.activePanel',
            'znk.infra-web-app.znkToast',
            'znk.infra.exerciseUtility',
            'znk.infra.znkTooltip',
            'znk.infra.calls',
            'znk.infra-web-app.znkLessonNotes'
        ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                let svgMap = {
                    'liveSession-english-icon': 'components/liveSession/svg/liveSession-verbal-icon.svg',
                    'liveSession-math-icon': 'components/liveSession/svg/liveSession-math-icon.svg',
                    'liveSession-start-lesson-popup-icon': 'components/liveSession/svg/liveSession-start-lesson-popup-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession')
        .component('liveSessionBtn', {
            bindings: {
                student: '='
            },
            templateUrl: 'components/liveSession/components/liveSessionBtn/liveSessionBtn.template.html',
            controllerAs: 'vm',
            controller: ["$q", "$log", "$scope", "$mdDialog", "LiveSessionSrv", "StudentContextSrv", "TeacherContextSrv", "PresenceService", "ENV", "LiveSessionStatusEnum", "ZnkLessonNotesSrv", "LessonStatusEnum", "UserProfileService", "LiveSessionUiSrv", "StudentService", "UtilitySrv", function ($q, $log, $scope, $mdDialog, LiveSessionSrv, StudentContextSrv, TeacherContextSrv,
                                  PresenceService, ENV, LiveSessionStatusEnum, ZnkLessonNotesSrv, LessonStatusEnum,
                                  UserProfileService, LiveSessionUiSrv, StudentService, UtilitySrv) {
                'ngInject';

                let SESSION_SETTINGS = {
                    marginBeforeSessionStart: ENV.liveSession.marginBeforeSessionStart,
                    marginAfterSessionStart: ENV.liveSession.marginAfterSessionStart,
                    length: ENV.liveSession.length,
                    queryLessonStart: ENV.liveSession.queryLessonStart,
                    queryLessonMultipleByNum: ENV.queryLessonMultipleByNum // multiple this number by the lesson length for the getScheduledLesson query
                };
                let liveSessionSettingsProm = ZnkLessonNotesSrv.getGlobalVariables().then(globalVariables => globalVariables.liveSession);
                let educatorProfileProm = UserProfileService.getProfile();

                this.$onInit = () => {
                    this.isLiveSessionActive = false;
                    this.isOffline = true;
                    this.isDiagnosticCompleted = false;
                    this.initializeLiveSessionStatus();

                    $scope.$watch('vm.student', newStudent => {
                        if (newStudent && angular.isDefined(newStudent.presence)) {
                            this.isOffline = newStudent.presence === PresenceService.userStatus.OFFLINE;
                            StudentService.getStudentResults(newStudent.uid).then(studentResults => {
                                StudentService.isDiagnosticCompleted(studentResults.examResults)
                                    .then(isDiagnosticCompleted => this.isDiagnosticCompleted = isDiagnosticCompleted);
                            });
                        }
                    }, true);

                    LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(this.liveSessionStateChanged);
                };

                this.initializeLiveSessionStatus = () => {
                    LiveSessionSrv.getActiveLiveSessionData().then(liveSessionData => {
                        if (liveSessionData) {
                            this.liveSessionStateChanged(liveSessionData.status);
                        }
                    });
                };

                this.showSessionModal = () => {
                    $mdDialog.show({
                        template: '<live-session-subject-modal student="vm.student"></live-session-subject-modal>',
                        scope: $scope,
                        preserveScope: true,
                        clickOutsideToClose: true
                    });
                };

                this.showStartSessionPopup = () => {
                    if (!this.isDiagnosticCompleted) {
                        $log.debug('showStartSessionPopup: Student didn\'t complete Diagnostic test');
                        return LiveSessionUiSrv.showIncompleteDiagnostic(this.student.name);
                    }

                    LiveSessionUiSrv.showWaitPopUp();

                    UserProfileService.getCurrUserId().then(educatorId => {
                        LiveSessionUiSrv.isDarkFeaturesValid(educatorId, this.student.uid)
                            .then(isDarkFeaturesValid => {
                                if (isDarkFeaturesValid) {
                                    $log.debug('darkFeatures in ON');
                                    this.getScheduledLessonData().then(scheduledLessonData => {
                                        LiveSessionUiSrv.closePopup();
                                        if (scheduledLessonData) {
                                            LiveSessionSrv.startLiveSession(this.student, scheduledLessonData);
                                        } else {
                                            LiveSessionUiSrv.showNoLessonScheduledPopup(this.student.name)
                                                .then(() => $log.debug('showSessionModal: No lesson is scheduled'));
                                        }
                                    });
                                } else {
                                    LiveSessionUiSrv.closePopup();
                                    this.showSessionModal();
                                }
                            }).catch(err => $log.error('isDarkFeaturesValid Error: ', err));
                    });
                };

                this.liveSessionStateChanged = (newLiveSessionState) => {
                    this.isLiveSessionActive = newLiveSessionState === LiveSessionStatusEnum.CONFIRMED.enum;
                };

                this.endSession = () => {
                    LiveSessionSrv.getActiveLiveSessionData().then(liveSessionData => {
                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                    });
                };

                this.getScheduledLessonData = () => {
                    let dataPromMap = {
                        liveSessionSettings: this.liveSessionSettings ? $q.when(this.liveSessionSettings) : liveSessionSettingsProm,
                        educatorProfile: this.educatorProfile ? $q.when(this.educatorProfile) : educatorProfileProm
                    };
                    return $q.all(dataPromMap).then(dataMap => {
                        this.liveSessionSettings = dataMap.liveSessionSettings;
                        this.educatorProfile = dataMap.educatorProfile;
                        SESSION_SETTINGS = this.liveSessionSettings ? this.liveSessionSettings : SESSION_SETTINGS;
                        let now = Date.now();
                        let calcStartTime = now - SESSION_SETTINGS.queryLessonStart;
                        let calcEndTime = now + (SESSION_SETTINGS.length * SESSION_SETTINGS.queryLessonMultipleByNum);
                        let dateRange = {
                            startDate: calcStartTime,
                            endDate: calcEndTime
                        };

                        return ZnkLessonNotesSrv.getLessonsByStudentIds([this.student.uid], dateRange, this.educatorProfile.uid)
                            .then(lessons => {
                                if (lessons && lessons.length) {
                                    lessons.sort(UtilitySrv.array.sortByField('date'));
                                    return this.getLessonInRange(lessons);
                                } else {
                                    return null;
                                }
                            }, err => $log.error('getScheduledLesson: getLessonsByStudentIds Error: ', err));
                    });


                };

                this.getLessonInRange = (lessons) => {
                    let scheduledLessonMap = {};
                    if (lessons && lessons.length > 0) {
                        // No multiple lesson return single lesson
                        if (lessons.length === 1) {
                            scheduledLessonMap.scheduledLesson = lessons.pop();
                            scheduledLessonMap.expectedSessionEndTime = scheduledLessonMap.scheduledLesson.date + SESSION_SETTINGS.length;
                        } else {
                            $log.debug(`getLessonInRange: multiple lesson - check if it's back to back`);
                            scheduledLessonMap = this.checkBack2BackLesson(lessons);
                        }
                    }
                    $log.debug(`getLessonInRange: lessons is not defined or lessons.length === 0 `);
                    return scheduledLessonMap;
                };

                this.checkBack2BackLesson = (lessons) => {
                    $log.debug(`checkBack2BackLesson`);
                    let scheduledLessonMap = {};
                    let back2BackLessons = [];
                    let now = Date.now();
                    lessons.forEach(lesson => {
                        let startTimeRange = lesson.date - SESSION_SETTINGS.marginBeforeSessionStart;
                        let endTimeRange = lesson.date + SESSION_SETTINGS.length + SESSION_SETTINGS.marginAfterSessionStart;
                        if ((startTimeRange < now < endTimeRange) && !scheduledLessonMap.scheduledLesson) {
                            scheduledLessonMap.scheduledLesson = lesson;
                            back2BackLessons.push(lesson);
                            scheduledLessonMap.expectedSessionEndTime = scheduledLessonMap.scheduledLesson.date + SESSION_SETTINGS.length;
                        } else if (scheduledLessonMap.scheduledLesson) {
                            // must be second iteration or above
                            if ((back2BackLessons[back2BackLessons.length-1].date + SESSION_SETTINGS.length) === lesson.date) {
                                $log.debug(`checkBack2BackLesson: b2b lesson found. lessonId: ${lesson.id}`);
                                // scenario when the second lesson in the array is the actual scheduledLesson and not the first one
                                if (lesson.date < now) {
                                    back2BackLessons.pop();
                                    scheduledLessonMap.scheduledLesson = lesson;
                                }
                                back2BackLessons.push(lesson);
                                scheduledLessonMap.expectedSessionEndTime = lesson.date + SESSION_SETTINGS.length;
                            } else {
                                $log.debug(`checkBack2BackLesson: this lesson isn't b2b lesson.`);
                            }
                        }
                    });

                    // add lessonSummaryId to scheduledLesson or all back2BackLessons if there isn't
                    let newLessonSummaryId = UtilitySrv.general.createGuid();

                    if (back2BackLessons.length > 1) {
                        if (!back2BackLessons[0].backToBackId) {
                            let newB2BLessonId = UtilitySrv.general.createGuid();
                            let updateB2BLessonProms = [];
                            back2BackLessons.forEach(b2bLesson => {
                                b2bLesson.lessonSummaryId = b2bLesson.lessonSummaryId || newLessonSummaryId;
                                b2bLesson.backToBackId = newB2BLessonId;
                                updateB2BLessonProms.push(ZnkLessonNotesSrv.updateLesson(b2bLesson));
                            });
                            Promise.all(updateB2BLessonProms)
                                .then(() => $log.debug(`checkBack2BackLesson: All back2backLesson are updated.`))
                                .catch((err) => $log.error('checkBack2BackLesson: Failed to update back2backLesson. Error: ', err));
                        } else {
                            $log.debug(`checkBack2BackLesson: back2BackLessons[0] all ready have backToBackId`);
                        }
                    } else {
                        scheduledLessonMap.scheduledLesson.lessonSummaryId = scheduledLessonMap.scheduledLesson.lessonSummaryId || newLessonSummaryId;
                        $log.debug(`checkBack2BackLesson: no back2back lesson just single scheduledLesson`);
                    }

                    return scheduledLessonMap;

                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').component('liveSessionFrame', {
            templateUrl: 'components/liveSession/components/liveSessionFrame/liveSessionFrame.template.html',
            bindings: {
                userLiveSessionState: '<',
                onClose: '&'
            },
            controllerAs: 'vm',
            controller: ["UserLiveSessionStateEnum", "$log", function (UserLiveSessionStateEnum, $log) {
                'ngInject';

                this.$onInit = () => {
                    if (this.userLiveSessionState) {
                        this.liveSessionCls = 'active-state';
                    } else {
                        $log.error('liveSessionComponent: invalid state was provided');
                    }
                };
            }]
        }
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession')
        .component('liveSessionSubjectModal', {
            bindings: {
                student: '=',
                lessonId: '='
            },
            templateUrl: 'components/liveSession/components/liveSessionSubjectModal/liveSessionSubjectModal.template.html',
            controllerAs: 'vm',
            controller: ["ENV", "$mdDialog", "LiveSessionSubjectSrv", "LiveSessionSrv", "ZnkLessonNotesSrv", function (ENV, $mdDialog, LiveSessionSubjectSrv, LiveSessionSrv, ZnkLessonNotesSrv) {
                'ngInject';

                 let liveSessionSettingsProm = ZnkLessonNotesSrv.getGlobalVariables()
                     .then(globalVariables => globalVariables.liveSession);

                this.$onInit = () =>  {
                    this.sessionSubjects = LiveSessionSubjectSrv.getLiveSessionTopics();
                    this.closeModal = $mdDialog.cancel;
                };

                this.startSession = (sessionSubject) => {
                    liveSessionSettingsProm.then(liveSessionSettings => {
                        let liveSessionLength = liveSessionSettings.length || ENV.liveSession.length;
                        let expectedSessionEndTime = LiveSessionSrv._getRoundTime() + liveSessionLength;
                        let lessonData = { sessionSubject, expectedSessionEndTime };
                        LiveSessionSrv.startLiveSession(this.student, lessonData);
                    });

                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').factory('LiveSessionStatusEnum',
        ["EnumSrv", function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['PENDING_STUDENT', 1, 'pending student'],
                ['PENDING_EDUCATOR', 2, 'pending educator'],
                ['CONFIRMED', 3, 'confirmed'],
                ['ENDED', 4, 'ended']
            ]);
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').factory('MyZinkerzTopicMapEnum',
        ["EnumSrv", function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['TOPIC_1', 1, 'topic_1'],
                ['TOPIC_2', 2, 'topic_2']
            ]);
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').factory('UserLiveSessionStateEnum',
        ["EnumSrv", function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['NONE', 1, 'none'],
                ['STUDENT', 2, 'student'],
                ['EDUCATOR', 3, 'educator']
            ]);
        }]
    );
})(angular);


(function(){
    'use strict';

    angular.module('znk.infra-web-app.liveSession').run(
        ["ActivePanelSrv", "LiveSessionEventsSrv", function(ActivePanelSrv, LiveSessionEventsSrv){
            'ngInject';
            ActivePanelSrv.loadActivePanel();
            LiveSessionEventsSrv.activate();
        }]
    );
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').service('LiveSessionSrv',
        ["UserProfileService", "InfraConfigSrv", "$q", "UtilitySrv", "LiveSessionDataGetterSrv", "LiveSessionStatusEnum", "ENV", "$log", "UserLiveSessionStateEnum", "LiveSessionUiSrv", "$interval", "CallsSrv", "CallsErrorSrv", "ZnkLessonNotesSrv", "LessonStatusEnum", "LessonNotesStatusEnum", "$window", "LiveSessionSubjectSrv", function (UserProfileService, InfraConfigSrv, $q, UtilitySrv, LiveSessionDataGetterSrv, LiveSessionStatusEnum,
                  ENV, $log, UserLiveSessionStateEnum, LiveSessionUiSrv, $interval, CallsSrv, CallsErrorSrv,
                  ZnkLessonNotesSrv, LessonStatusEnum, LessonNotesStatusEnum, $window, LiveSessionSubjectSrv) {
            'ngInject';

            let SESSION_SETTINGS = {
                length: ENV.liveSession.length,
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

                    // create lesson summary in documentDB/cosmosDB
                    this._saveLessonSummary(data.liveSessionData);

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

            this._updateLessonsStatus = (liveSessionData) => {
                return LiveSessionUiSrv.isDarkFeaturesValid(liveSessionData.educatorId, liveSessionData.studentId)
                    .then(isDarkFeaturesValid => {
                        if (isDarkFeaturesValid) {
                            if (liveSessionData.backToBackId) {
                                return ZnkLessonNotesSrv.updateLessonsStatus(liveSessionData.backToBackId, LessonStatusEnum.ATTENDED.enum, true);
                            } else {
                                return ZnkLessonNotesSrv.updateLessonsStatus(liveSessionData.lessonId, LessonStatusEnum.ATTENDED.enum, false);
                            }
                        } else {
                            $log.debug('_updateLesson: darkFeatures in OFF');
                        }
                    }).catch(err => $log.error('isDarkFeaturesValid Error: ', err));
            };

            this._saveLessonSummary = (liveSessionData) => {
                return LiveSessionUiSrv.isDarkFeaturesValid(liveSessionData.educatorId, liveSessionData.studentId)
                    .then(isDarkFeaturesValid => {
                        if (isDarkFeaturesValid) {
                            let lessonSummary = {
                                id: liveSessionData.lessonSummaryId,
                                startTime: liveSessionData.startTime,
                                endTime: liveSessionData.endTime,
                                lessonNotes: {
                                    status: LessonNotesStatusEnum.PENDING_NOTES.enum
                                },
                                liveSessions: [liveSessionData.guid]
                            };
                            return ZnkLessonNotesSrv.saveLessonSummary(lessonSummary);
                        } else {
                            $log.debug('_updateLesson: darkFeatures in OFF');
                        }
                    }).catch(err => $log.error('isDarkFeaturesValid Error: ', err));
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
                            sessionSubject: LiveSessionSubjectSrv.getSessionSubject(lessonData)
                        };

                        if (lessonData.scheduledLesson) {
                            // add lessonSummaryId prop to liveSessionObj to popup lessonNotes/rating in the end of the lesson
                            newLiveSessionData.lessonSummaryId = lessonData.scheduledLesson.lessonSummaryId;
                            if (lessonData.scheduledLesson.backToBackId) {
                                newLiveSessionData.backToBackId = lessonData.scheduledLesson.backToBackId;
                            } else {
                                newLiveSessionData.lessonId = lessonData.scheduledLesson.id;
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
                    liveSessionData.extendTime += SESSION_SETTINGS.extendTime;
                    return liveSessionData.$save();
                }).then(() => {
                    let extendTimeInMin = SESSION_SETTINGS.extendTime / 60000; // convert to minutes
                    $log.debug('confirmExtendSession: Live session is extend by ' + extendTimeInMin + ' minutes.');
                }).catch(() => {
                    $log.debug('confirmExtendSession: Failed to save extend live session in guid: ' + activeLiveSessionDataFromAdapter.guid);
                });
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').service('LiveSessionDataGetterSrv',
        ["InfraConfigSrv", "$q", "ENV", "UserProfileService", "ZnkLessonNotesSrv", function (InfraConfigSrv, $q, ENV, UserProfileService, ZnkLessonNotesSrv) {
            'ngInject';

            let _this = this;

            this._getStorage = () => {
                return InfraConfigSrv.getGlobalStorage();
            };

            this.getLiveSessionDataPath = (guid) => {
                let LIVE_SESSION_ROOT_PATH = '/liveSession/';
                return LIVE_SESSION_ROOT_PATH + guid;
            };

            this.getUserLiveSessionRequestsPath  = (userData) => {
                let appName = userData.isTeacher ? ENV.dashboardAppName : ENV.studentAppName;
                let USER_DATA_PATH = appName  + '/users/' + userData.uid;
                return USER_DATA_PATH + '/liveSession';
            };

            this.getLiveSessionData = (liveSessionGuid) => {
                let liveSessionDataPath = _this.getLiveSessionDataPath(liveSessionGuid);
                return this._getStorage().then((storage) => {
                    return storage.getAndBindToServer(liveSessionDataPath);
                });
            };

            this.getLiveSessionDuration = () => {
                return ZnkLessonNotesSrv.getGlobalVariables()
                    .then(globalVariables => globalVariables.liveSession);
            };

            this.getCurrUserLiveSessionRequests = () => {
                return UserProfileService.getCurrUserId().then(currUid => {
                    return this._getStorage().then(storage => {
                        let currUserLiveSessionDataPath = ENV.firebaseAppScopeName + '/users/' + currUid + '/liveSession/active';
                        return storage.getAndBindToServer(currUserLiveSessionDataPath);
                    });
                });
            };

            this.getCurrUserLiveSessionData = () => {
                return _this.getCurrUserLiveSessionRequests().then((currUserLiveSessionRequests) =>{
                    let liveSessionDataPromMap = {};
                    angular.forEach(currUserLiveSessionRequests, (isActive, guid) => {
                        if(isActive){
                            liveSessionDataPromMap[guid] = _this.getLiveSessionData(guid);
                        }
                    });

                    return $q.all(liveSessionDataPromMap);
                });
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionEventsSrv', function () {
        'ngInject';
        let isEnabled = true;

        this.enabled = (_isEnabled) => {
            isEnabled = _isEnabled;
        };

        this.$get = ["UserProfileService", "InfraConfigSrv", "$q", "StorageSrv", "ENV", "LiveSessionStatusEnum", "UserLiveSessionStateEnum", "$log", "LiveSessionUiSrv", "LiveSessionSrv", "LiveSessionDataGetterSrv", "ZnkLessonNotesSrv", "UserTypeContextEnum", "ZnkLessonNotesUiSrv", function (UserProfileService, InfraConfigSrv, $q, StorageSrv, ENV, LiveSessionStatusEnum,
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

                if (liveSessionData.studentId !== currUid) {
                    LiveSessionSrv.hangCall(liveSessionData.studentId);
                    LiveSessionSrv._destroyCheckDurationInterval();
                }

                if (isStudentDeclineTheSession) {
                    if (liveSessionData.educatorId === currUid) {
                        LiveSessionUiSrv.showStudentDeclineSessionPopup();
                    }
                } else {
                    LiveSessionUiSrv.showEndSessionPopup()
                        .then(() => {
                            LiveSessionUiSrv.isDarkFeaturesValid(liveSessionData.educatorId, liveSessionData.studentId)
                                .then(isDarkFeaturesValid => {
                                    if (isDarkFeaturesValid) {
                                        $log.debug('darkFeatures in ON');
                                        if (liveSessionData.lessonSummaryId) {
                                            ZnkLessonNotesSrv.getLessonSummaryById(liveSessionData.lessonSummaryId).then(lessonSummary => {
                                                if (liveSessionData.educatorId === currUid) {
                                                    ZnkLessonNotesUiSrv.openLessonNotesPopup(lessonSummary, UserTypeContextEnum.EDUCATOR.enum);
                                                } else {
                                                    ZnkLessonNotesUiSrv.openLessonRatingPopup(lessonSummary, UserTypeContextEnum.STUDENT.enum);
                                                }
                                            });
                                        } else {
                                            $log.debug('endLiveSession: There is NO lessonSummaryId on liveSessionData');
                                        }
                                    } else {
                                        $log.debug('darkFeatures in OFF');
                                    }
                                }).catch(err => $log.error('isDarkFeaturesValid Error: ', err));
                        });
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
        }];
    });
})(angular);

(function (angular) {
    'use strict';


    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionSubjectSrv', ["LiveSessionSubjectConst", function (LiveSessionSubjectConst) {
        'ngInject';
        let topics = [LiveSessionSubjectConst.MATH, LiveSessionSubjectConst.ENGLISH];

        this.setLiveSessionTopics = (_topics) => {
            if (angular.isArray(_topics) && _topics.length) {
                topics = _topics;
            }
        };

        this.$get = ["UtilitySrv", "MyZinkerzTopicMapEnum", function (UtilitySrv, MyZinkerzTopicMapEnum) {

            let LiveSessionSubjectSrv = {};

            LiveSessionSubjectSrv.getLiveSessionTopics = () => {
                return topics.map(function (topicId) {
                    let topicName = UtilitySrv.object.getKeyByValue(LiveSessionSubjectConst, topicId).toLowerCase();
                    return {
                        id: topicId,
                        name: topicName,
                        iconName: 'liveSession-' + topicName + '-icon'
                    };
                });
            };

            LiveSessionSubjectSrv.getSessionSubject = (lessonData) => {
                console.log('_getSessionSubject lessonData : ', lessonData);
                if (lessonData.sessionSubject) {
                    return lessonData.sessionSubject.id;
                } else {
                    let topicIdNum = MyZinkerzTopicMapEnum[lessonData.scheduledLesson.topicId.toUpperCase()].enum;
                    if (angular.isDefined(topicIdNum)) {
                        return topicIdNum;
                    } else {
                        throw new Error('Error: getSessionSubject: subjectId/topicId is undefined!');
                    }
                }
            };

            return LiveSessionSubjectSrv;
        }];
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionUiSrv', function () {
        'ngInject';
        this.$get = ["$rootScope", "$timeout", "$compile", "$animate", "PopUpSrv", "$translate", "$q", "$log", "ENV", "ZnkToastSrv", "LiveSessionDataGetterSrv", "UserProfileService", function ($rootScope, $timeout, $compile, $animate, PopUpSrv, $translate, $q, $log, ENV,
                     ZnkToastSrv, LiveSessionDataGetterSrv, UserProfileService) {

            let LiveSessionUiSrv = {};
            let childScope, liveSessionPhElement, readyProm;
            let darkFeaturesValid = null;

            let SESSION_SETTINGS = {
                length: ENV.liveSession.length,
                extendTime: ENV.liveSession.sessionExtendTime,
            };

            LiveSessionUiSrv._init = () => {
                let bodyElement = angular.element(document.body);

                liveSessionPhElement = angular.element('<div class="live-session-ph"></div>');

                bodyElement.append(liveSessionPhElement);

                //load liveSessionDuration from firebase
                LiveSessionDataGetterSrv.getLiveSessionDuration()
                    .then((liveSessionDuration) => {
                        if (liveSessionDuration) {
                            SESSION_SETTINGS = liveSessionDuration;
                        }
                    }).catch(err => {
                    $log.error('LiveSessionUiSrv: getLiveSessionDuration Error: ' + err);
                });
            };

            LiveSessionUiSrv.endLiveSession = () => {
                if (childScope) {
                    childScope.$destroy();
                }

                if (liveSessionPhElement) {
                    let hasContents = !!liveSessionPhElement.contents().length;
                    if (hasContents) {
                        $animate.leave(liveSessionPhElement.contents());
                    }
                }
            };

            LiveSessionUiSrv.activateLiveSession = (userLiveSessionState) => {
                LiveSessionUiSrv.endLiveSession();

                let defer = $q.defer();

                readyProm.then(() => {
                    childScope = $rootScope.$new(true);
                    childScope.d = {
                        userLiveSessionState: userLiveSessionState,
                        onClose: () => {
                            defer.resolve('closed');
                        }
                    };

                    let liveSessionHtmlTemplate =
                        '<div class="show-hide-animation">' +
                        '<live-session-frame user-live-session-state="d.userLiveSessionState" ' +
                        'on-close="d.onClose()">' +
                        '</live-session-frame>' +
                        '</div>';
                    let liveSessionElement = angular.element(liveSessionHtmlTemplate);
                    liveSessionPhElement.append(liveSessionElement);
                    $animate.enter(liveSessionElement[0], liveSessionPhElement[0]);
                    $compile(liveSessionPhElement)(childScope);
                });

                return defer.promise;
            };

            LiveSessionUiSrv.showStudentConfirmationPopUp = () => {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.LIVE_SESSION_REQUEST');
                translationsPromMap.content = $translate('LIVE_SESSION.WANT_TO_JOIN');
                translationsPromMap.acceptBtnTitle = $translate('LIVE_SESSION.JOIN');
                translationsPromMap.cancelBtnTitle = $translate('LIVE_SESSION.DECLINE');
                return $q.all(translationsPromMap)
                    .then(translations => {
                        let popUpInstance = PopUpSrv.warning(
                            translations.title,
                            translations.content,
                            translations.acceptBtnTitle,
                            translations.cancelBtnTitle
                        );
                        return popUpInstance.promise
                            .then(res => $q.resolve(res))
                            .catch(err => $q.reject(err));
                    }).catch(err => {
                        $log.error('LiveSessionUiSrv: showStudentConfirmationPopUp Error: ' + err);
                        return $q.reject(err);
                    });
            };

            LiveSessionUiSrv.showEducatorPendingPopUp = () => {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.LIVE_SESSION_REQUEST');
                translationsPromMap.content = $translate('LIVE_SESSION.WAIT_TO_STUDENT');
                translationsPromMap.cancelBtnTitle = $translate('LIVE_SESSION.CANCEL');
                return $q.all(translationsPromMap)
                    .then(translations => {
                        PopUpSrv.wait(translations.title, translations.content, translations.cancelBtnTitle);
                    }).catch(err => {
                        $log.error('LiveSessionUiSrv: showEducatorPendingPopUp Error: ' + err);
                        return $q.reject(err);
                    });
            };

            LiveSessionUiSrv.showWaitPopUp = () => {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.STARTING_SESSION');
                return $q.all(translationsPromMap)
                    .then(translations => {
                        PopUpSrv.wait(translations.title);
                    }).catch(err => {
                        $log.error('LiveSessionUiSrv: showWaitPopUp Error: ' + err);
                        return $q.reject(err);
                    });
            };

            LiveSessionUiSrv.showSessionEndAlertPopup = () => {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.END_ALERT');
                translationsPromMap.content = $translate('LIVE_SESSION.EXTEND_SESSION', {extendTime: SESSION_SETTINGS.extendTime / 60000});
                translationsPromMap.extendBtnTitle = $translate('LIVE_SESSION.EXTEND');
                translationsPromMap.cancelBtnTitle = $translate('LIVE_SESSION.CANCEL');
                return $q.all(translationsPromMap)
                    .then(translations => {
                        let popUpInstance = PopUpSrv.warning(
                            translations.title,
                            translations.content,
                            translations.cancelBtnTitle,
                            translations.extendBtnTitle
                        );
                        return popUpInstance.promise
                        // todo: figure out why it's opposite
                            .then(res => $q.reject(res))
                            .catch(err => $q.resolve(err));
                    }).catch(err => {
                        $log.error('LiveSessionUiSrv: showSessionEndAlertPopup Error: ' + err);
                        return $q.reject(err);
                    });
            };

            LiveSessionUiSrv.showEndSessionPopup = () => {
                LiveSessionUiSrv.closePopup();
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.END_POPUP_TITLE');
                translationsPromMap.content = $translate('LIVE_SESSION.END_POPUP_CONTENT');
                return $q.all(translationsPromMap)
                    .then(translations => {
                        let popUpInstance = PopUpSrv.info(
                            translations.title,
                            translations.content
                        );
                        return popUpInstance.promise
                            .then(res => $q.resolve(res))
                            .catch(err => $q.reject(err));
                    }).catch(err => {
                        $log.error('LiveSessionUiSrv: showEndSessionPopup Error: ' + err);
                        return $q.reject(err);
                    });
            };

            LiveSessionUiSrv.showStudentDeclineSessionPopup = () => {
                LiveSessionUiSrv.closePopup();
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.LIVE_SESSION_REQUEST');
                translationsPromMap.content = $translate('LIVE_SESSION.STUDENT_DECLINE_SESSION');
                return $q.all(translationsPromMap)
                    .then(translations => {
                        let popUpInstance = PopUpSrv.info(
                            translations.title,
                            translations.content
                        );
                        return popUpInstance.promise
                            .then(res => $q.resolve(res))
                            .catch(err => $q.reject(err));
                    }).catch(err => {
                        $log.error('LiveSessionUiSrv: showStudentDeclineSessionPopup Error ' + err);
                        return $q.reject(err);
                    });
            };

            LiveSessionUiSrv.showIncompleteDiagnostic = (studentName) => {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.CANT_START_SESSION');
                translationsPromMap.content = $translate('LIVE_SESSION.INCOMPLETE_DIAGNOSTIC_CONTENT', {studentName: studentName});
                return $q.all(translationsPromMap)
                    .then(translations => {
                        PopUpSrv.info(translations.title, translations.content);
                    }).catch(err => {
                        $log.error('LiveSessionUiSrv: showIncompleteDiagnostic Error: ' + err);
                        return $q.reject(err);
                    });
            };

            LiveSessionUiSrv.showNoLessonScheduledPopup = (studentName) => {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.CANT_START_SESSION');
                translationsPromMap.content = $translate('LIVE_SESSION.NO_LESSON_SCHEDULED', {studentName: studentName});
                return $q.all(translationsPromMap)
                    .then(translations => {
                        PopUpSrv.info(translations.title, translations.content);
                    }).catch(err => {
                        $log.error('LiveSessionUiSrv: showNoLessonScheduledPopup Error: ' + err);
                        return $q.reject(err);
                    });
            };

            LiveSessionUiSrv.showLiveSessionToast = () => {
                let options = {
                    hideDelay: 5000,
                    position: 'top right',
                    toastClass: 'live-session-success-toast'
                };
                let translationsProm = $translate('LIVE_SESSION.JOIN_TO_ACTIVE_SESSION');
                translationsProm.then(message => {
                    ZnkToastSrv.showToast('success', message, options);
                });
            };

            LiveSessionUiSrv.closePopup = () => {
                if (PopUpSrv.isPopupOpen()) {
                    PopUpSrv.closePopup();
                }
            };

            LiveSessionUiSrv.isDarkFeaturesValid = (educatorId, studentId) => {
                if (darkFeaturesValid !== null) {
                    return Promise.resolve(darkFeaturesValid);
                } else {
                    return UserProfileService.darkFeaturesValid([educatorId, studentId])
                        .then(isValid => {
                            darkFeaturesValid = isValid;
                            return darkFeaturesValid;
                        });
                }
            };

            // was wrapped with timeout since angular will compile the dom after this service initialization
            readyProm = $timeout(() => {
                LiveSessionUiSrv._init();
            });

            return LiveSessionUiSrv;
        }];
    });
})(angular);

angular.module('znk.infra-web-app.liveSession').run(['$templateCache', function ($templateCache) {
  $templateCache.put("components/liveSession/components/liveSessionBtn/liveSessionBtn.template.html",
    "<md-button class=\"session-btn\" ng-disabled=\"vm.isOffline && !vm.isLiveSessionActive\"\n" +
    "           aria-label=\"{{!vm.isLiveSessionActive ? 'LIVE_SESSION.START_SESSION' : 'LIVE_SESSION.END_SESSION' | translate}}\"\n" +
    "           ng-class=\"{'offline': vm.isOffline, 'end-session': vm.isLiveSessionActive}\"\n" +
    "           ng-click=\"!vm.isLiveSessionActive ? vm.showStartSessionPopup() : vm.endSession()\">\n" +
    "\n" +
    "    <span ng-if=\"!vm.isLiveSessionActive\">\n" +
    "        <md-tooltip znk-tooltip class=\"md-fab\">\n" +
    "            {{'LIVE_SESSION.START_SESSION' | translate}}\n" +
    "        </md-tooltip>\n" +
    "        {{'LIVE_SESSION.START_SESSION' | translate}}\n" +
    "    </span>\n" +
    "\n" +
    "    <span ng-if=\"vm.isLiveSessionActive\" title=\"{{'LIVE_SESSION.END_SESSION' | translate}}\">\n" +
    "        <md-tooltip znk-tooltip class=\"md-fab\">\n" +
    "            <div class=\"arrow-up\"></div>\n" +
    "            {{'LIVE_SESSION.END_SESSION' | translate}}\n" +
    "        </md-tooltip>\n" +
    "        {{'LIVE_SESSION.END_SESSION' | translate}}\n" +
    "    </span>\n" +
    "</md-button>\n" +
    "");
  $templateCache.put("components/liveSession/components/liveSessionFrame/liveSessionFrame.template.html",
    "<div ng-if=\"vm.userLiveSessionState\"\n" +
    "     ng-class=\"vm.liveSessionCls\">\n" +
    "    <div class=\"active-state-container\">\n" +
    "        <div class=\"square-side top\"></div>\n" +
    "        <div class=\"square-side right\"></div>\n" +
    "        <div class=\"square-side bottom\"></div>\n" +
    "        <div class=\"square-side left\"></div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/liveSession/components/liveSessionSubjectModal/liveSessionSubjectModal.template.html",
    "<div class=\"live-session-subject-modal\">\n" +
    "    <div class=\"base base-border-radius session-container\" translate-namespace=\"LIVE_SESSION\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <div class=\"top-icon-wrap\">\n" +
    "                <div class=\"top-icon\">\n" +
    "                    <div class=\"round-icon-wrap\">\n" +
    "                        <svg-icon name=\"liveSession-start-lesson-popup-icon\"></svg-icon>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"popup-content\">\n" +
    "            <div class=\"main-title\" translate=\".START_SESSION\"></div>\n" +
    "            <div class=\"sub-title\" translate=\".SESSION_SUBJECT\"></div>\n" +
    "            <div class=\"subjects-btns\">\n" +
    "                <button class=\"subject-icon-wrap\"\n" +
    "                        ng-repeat=\"subject in ::vm.sessionSubjects\"\n" +
    "                        ng-class=\"subject.name\"\n" +
    "                        ng-click=\"vm.startSession(subject); vm.closeModal();\">\n" +
    "                    <svg-icon name={{subject.iconName}}></svg-icon>\n" +
    "                    <span>{{subject.name}}</span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/liveSession/svg/liveSession-english-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xml:space=\"preserve\" x=\"0px\" y=\"0px\"\n" +
    "     viewBox=\"0 0 80 80\" class=\"reading-svg\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .reading-svg {\n" +
    "        width: 100%;\n" +
    "        height: auto;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "    <g>\n" +
    "        <path d=\"M4.2,11.3c0.3,0,0.5-0.1,0.7-0.1c3.5,0.2,6.9-0.4,10.3-1.5c6.6-2.1,13.1-1,19.6,0.9c3.8,1.1,7.7,1.1,11.5,0\n" +
    "		c7.8-2.3,15.5-3,23.1,0.4c0.5,0.2,1.1,0.2,1.6,0.2c1.8,0,3.6,0,5.5,0c0,17.3,0,34.5,0,51.8c-10,0-20.1,0-30.1,0\n" +
    "		c-0.1,0.8-0.1,1.4-0.2,2.1c-3.6,0-7.2,0-11,0c0-0.6-0.1-1.3-0.2-2.1c-10.3,0-20.5,0-30.9,0C4.2,45.7,4.2,28.6,4.2,11.3z M39.4,60.5\n" +
    "		c0-1.1,0-1.8,0-2.5c0-13.2,0.1-26.4,0.1-39.6c0-4.2,0-4.2-4-5.6c-8.5-2.9-17-3.6-25.3,0.6c-1.2,0.6-1.7,1.3-1.7,2.8\n" +
    "		c0.1,13.9,0,27.9,0,41.8c0,0.6,0,1.2,0,1.9C18.8,57.6,29,56.7,39.4,60.5z M72.2,60c0-0.8,0-1.5,0-2.1c0-12.8,0-25.6,0-38.5\n" +
    "		c0-5.6,0-5.7-5.5-7.5c-8.1-2.8-15.8-1.2-23.4,1.8c-1.4,0.5-1.8,1.3-1.8,2.7c0,14.1,0,28.1,0,42.2c0,0.6,0,1.2,0,2\n" +
    "		C51.7,56.8,61.9,57.6,72.2,60z\"/>\n" +
    "        <path d=\"M33.2,25.1c-0.2,0-0.5-0.1-0.7-0.2c-9.2-5.2-17-0.3-17.3-0.1c-0.7,0.4-1.6,0.3-2.1-0.4\n" +
    "		c-0.5-0.7-0.3-1.6,0.4-2c0.4-0.3,9.5-6.2,20.4-0.1c0.7,0.4,1,1.3,0.6,2C34.2,24.8,33.7,25.1,33.2,25.1z\"/>\n" +
    "        <path d=\"M33.2,33.2c-0.2,0-0.5-0.1-0.7-0.2c-9.2-5.2-17-0.3-17.3-0.1c-0.7,0.4-1.6,0.3-2.1-0.4\n" +
    "		c-0.5-0.7-0.3-1.6,0.4-2c0.4-0.3,9.5-6.2,20.4-0.1c0.7,0.4,1,1.3,0.6,2C34.2,33,33.7,33.2,33.2,33.2z\"/>\n" +
    "        <path d=\"M33.2,41.4c-0.2,0-0.5-0.1-0.7-0.2c-9.2-5.2-17-0.3-17.3-0.1c-0.7,0.4-1.6,0.3-2.1-0.4\n" +
    "		c-0.5-0.7-0.3-1.6,0.4-2c0.4-0.3,9.5-6.2,20.4-0.1c0.7,0.4,1,1.3,0.6,2C34.2,41.1,33.7,41.4,33.2,41.4z\"/>\n" +
    "        <path d=\"M33.2,49.5c-0.2,0-0.5-0.1-0.7-0.2c-9.2-5.2-17-0.3-17.3-0.1c-0.7,0.4-1.6,0.3-2.1-0.4\n" +
    "		c-0.5-0.7-0.3-1.6,0.4-2c0.4-0.3,9.5-6.2,20.4-0.1c0.7,0.4,1,1.3,0.6,2C34.2,49.3,33.7,49.5,33.2,49.5z\"/>\n" +
    "        <path d=\"M66.5,24.7c-0.2,0-0.5-0.1-0.7-0.2c-9.2-5.2-17-0.3-17.3-0.1c-0.7,0.4-1.6,0.3-2.1-0.4\n" +
    "		c-0.5-0.7-0.3-1.6,0.4-2c0.4-0.3,9.5-6.2,20.4-0.1c0.7,0.4,1,1.3,0.6,2C67.6,24.5,67.1,24.7,66.5,24.7z\"/>\n" +
    "        <path d=\"M66.5,32.9c-0.2,0-0.5-0.1-0.7-0.2c-9.2-5.2-17-0.3-17.3-0.1c-0.7,0.4-1.6,0.3-2.1-0.4\n" +
    "		c-0.5-0.7-0.3-1.6,0.4-2c0.4-0.3,9.5-6.2,20.4-0.1c0.7,0.4,1,1.3,0.6,2C67.6,32.6,67.1,32.9,66.5,32.9z\"/>\n" +
    "        <path d=\"M66.5,41c-0.2,0-0.5-0.1-0.7-0.2c-9.2-5.2-17-0.3-17.3-0.1c-0.7,0.4-1.6,0.3-2.1-0.4\n" +
    "		c-0.5-0.7-0.3-1.6,0.4-2c0.4-0.3,9.5-6.2,20.4-0.1c0.7,0.4,1,1.3,0.6,2C67.6,40.7,67.1,41,66.5,41z\"/>\n" +
    "        <path d=\"M66.5,49.2c-0.2,0-0.5-0.1-0.7-0.2c-9.2-5.2-17-0.3-17.3-0.1c-0.7,0.4-1.6,0.3-2.1-0.4\n" +
    "		c-0.5-0.7-0.3-1.6,0.4-2c0.4-0.3,9.5-6.2,20.4-0.1c0.7,0.4,1,1.3,0.6,2C67.6,48.9,67.1,49.2,66.5,49.2z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveSession/svg/liveSession-math-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xml:space=\"preserve\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "     class=\"math-icon-svg\"\n" +
    "	 viewBox=\"-554 409.2 90 83.8\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .math-icon-svg{\n" +
    "            width: 100%;\n" +
    "            height: auto;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "<g>\n" +
    "	<path d=\"M-491.4,447.3c-3,0-6.1,0-9.1,0c-2.9,0-4.7-1.8-4.7-4.7c0-6.1,0-12.1,0-18.2c0-2.9,1.8-4.7,4.7-4.7c6,0,12,0,18,0\n" +
    "		c2.8,0,4.7,1.9,4.7,4.7c0,6.1,0,12.1,0,18.2c0,2.8-1.8,4.6-4.6,4.6C-485.4,447.4-488.4,447.3-491.4,447.3z M-491.4,435.5\n" +
    "		c2.5,0,5,0,7.5,0c1.6,0,2.5-0.8,2.4-2c-0.1-1.5-1.1-1.9-2.4-1.9c-5,0-10.1,0-15.1,0c-1.6,0-2.6,0.8-2.5,2c0.2,1.4,1.1,1.9,2.5,1.9\n" +
    "		C-496.5,435.5-494,435.5-491.4,435.5z\"/>\n" +
    "	<path d=\"M-526.6,447.3c-3,0-6,0-8.9,0c-3,0-4.7-1.8-4.8-4.8c0-6,0-11.9,0-17.9c0-3,1.9-4.8,4.9-4.8c5.9,0,11.8,0,17.7,0\n" +
    "		c3.1,0,4.9,1.8,4.9,4.8c0,6,0,11.9,0,17.9c0,3.1-1.8,4.8-4.9,4.8C-520.6,447.4-523.6,447.3-526.6,447.3z M-526.4,443.5\n" +
    "		c1.3-0.1,2-0.9,2-2.2c0.1-1.5,0.1-3,0-4.5c0-1.1,0.4-1.4,1.4-1.4c1.4,0.1,2.8,0,4.1,0c1.3,0,2.2-0.5,2.2-1.9c0.1-1.3-0.8-2-2.3-2\n" +
    "		c-1.4,0-2.8-0.1-4.1,0c-1.2,0.1-1.6-0.4-1.5-1.6c0.1-1.4,0-2.8,0-4.1c0-1.3-0.6-2.2-1.9-2.2c-1.4,0-2,0.8-2,2.2c0,1.5,0,3,0,4.5\n" +
    "		c0,1-0.3,1.3-1.3,1.3c-1.5,0-3,0-4.5,0c-1.3,0-2.2,0.6-2.2,2c0,1.4,0.9,1.9,2.2,1.9c1.5,0,3,0,4.5,0c1.1,0,1.4,0.4,1.4,1.4\n" +
    "		c-0.1,1.5,0,3,0,4.5C-528.4,442.6-527.8,443.3-526.4,443.5z\"/>\n" +
    "	<path d=\"M-526.5,454.9c3,0,6,0,8.9,0c3,0,4.8,1.8,4.8,4.8c0,6,0,12,0,18c0,2.9-1.8,4.7-4.7,4.7c-6.1,0-12.1,0-18.2,0\n" +
    "		c-2.8,0-4.6-1.9-4.6-4.6c0-6.1,0-12.1,0-18.2c0-2.9,1.8-4.6,4.7-4.7C-532.5,454.8-529.5,454.9-526.5,454.9z M-526.7,471.1\n" +
    "		c1.6,1.7,2.9,3,4.2,4.3c0.9,0.9,1.9,1.2,3,0.3c1-0.8,0.9-1.9-0.2-3.1c-1-1.1-2.1-2.1-3.2-3.2c-0.6-0.6-0.6-1.1,0-1.7\n" +
    "		c1-1,2-1.9,2.9-2.9c1.3-1.3,1.4-2.4,0.4-3.3c-0.9-0.8-2-0.7-3.2,0.5c-1.2,1.3-2.3,2.6-3.8,4.3c-1.5-1.7-2.6-3-3.8-4.2\n" +
    "		c-1.2-1.3-2.4-1.4-3.3-0.5c-1,0.9-0.8,2,0.5,3.3c1.2,1.2,2.4,2.4,3.8,3.8c-1.4,1.4-2.7,2.6-3.9,3.8c-1.2,1.2-1.3,2.3-0.3,3.2\n" +
    "		c0.9,0.9,2,0.8,3.2-0.4C-529.2,473.9-528.1,472.6-526.7,471.1z\"/>\n" +
    "	<path d=\"M-505.2,468.5c0-3,0-6,0-8.9c0-2.9,1.7-4.7,4.7-4.7c6.1,0,12.1,0,18.2,0c2.9,0,4.6,1.8,4.7,4.7c0,6,0,12,0,18\n" +
    "		c0,2.8-1.9,4.7-4.7,4.7c-6.1,0-12.1,0-18.2,0c-2.8,0-4.6-1.8-4.6-4.6C-505.3,474.7-505.2,471.6-505.2,468.5z M-491.4,476\n" +
    "		c2.5,0,5,0,7.5,0c1.3,0,2.3-0.5,2.4-1.9c0.1-1.3-0.8-2.1-2.4-2.1c-5,0-10.1,0-15.1,0c-1.6,0-2.6,0.9-2.5,2.1\n" +
    "		c0.2,1.4,1.1,1.9,2.5,1.9C-496.5,476-494,476-491.4,476z M-491.4,461.2c-2.5,0-5.1,0-7.6,0c-1.6,0-2.6,0.8-2.5,2\n" +
    "		c0.2,1.4,1.1,1.9,2.5,1.9c5,0,10.1,0,15.1,0c1.3,0,2.3-0.4,2.4-1.9c0.1-1.3-0.8-2-2.4-2C-486.4,461.2-488.9,461.2-491.4,461.2z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveSession/svg/liveSession-start-lesson-popup-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 170.1 126.2\" xml:space=\"preserve\" class=\"start-lesson-icon-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.start-lesson-icon-svg {width: 100%; height: auto;}\n" +
    "	.start-lesson-icon-svg .st0{fill:#ffffff;enable-background:new;}\n" +
    "</style>\n" +
    "<g class=\"st0\">\n" +
    "	<path d=\"M63.6,90.4c0,11.8,0,23.6,0,35.8c-21.1,0-42,0-63.2,0c-0.1-1.5-0.3-2.9-0.3-4.4c0-14.7-0.1-29.3,0-44\n" +
    "		c0.1-14.4,6.9-21,21.2-21c8,0,16,0,24,0c7.6,0.1,14.3,2.6,19.7,8.2c4.8,4.9,9.6,9.7,14.5,14.5C83.1,83,87,83,90.7,79.4\n" +
    "		c5.3-5.3,10.5-10.7,15.9-15.9c4.9-4.7,10.4-4.1,14.1,1.1c2.6,3.7,2.2,7.4-0.8,10.5c-8.7,9.2-17.5,18.3-26.5,27.1\n" +
    "		c-5.4,5.2-10.8,5.1-16.4-0.1c-4.2-3.9-7.9-8.5-11.8-12.8C64.6,89.6,64.1,90,63.6,90.4z\"/>\n" +
    "	<path d=\"M161.5,117.4c0-36.7,0-72.4,0-108.4c-25.6,0-51,0-76.8,0c0,17.3,0,34.4,0,51.9c-3.1,0-5.8,0-8.8,0c0-20.1,0-40.2,0-60.6\n" +
    "		c31.4,0,62.6,0,94.2,0c0,41.8,0,83.5,0,125.6c-31.3,0-62.6,0-94.3,0c0-2.7,0-5.3,0-8.5C104.3,117.4,132.7,117.4,161.5,117.4z\"/>\n" +
    "	<path d=\"M6.6,25.3C6.6,11,17.9-0.2,32,0c13.7,0.2,25.1,11.7,25.1,25.4c0,13.9-11.7,25.5-25.6,25.3C17.8,50.6,6.6,39.2,6.6,25.3z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveSession/svg/liveSession-verbal-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\" y=\"0px\" viewBox=\"-586.4 16.3 301.4 213.6\" xml:space=\"preserve\"\n" +
    "    class=\"verbal-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "    .verbal-icon-svg {width: 100%; height: auto;}\n" +
    "    .verbal-icon-svg .st0{fill:none;enable-background:new    ;}\n" +
    "</style>\n" +
    "<path d=\"M-546.8,113.1c0-20.2,0-40.3,0-60.5c0-7.8,0.9-9.1,8.7-8c11.5,1.5,22.9,3.7,34.3,6.1c3.5,0.7,6.8,2.7,10,4.3\n" +
    "	c6.3,3.2,9.2,7.7,9.1,15.5c-0.5,36.6-0.2,73.3-0.2,110c0,8.6-1.3,9.5-9.4,6.7c-15.1-5.2-30.4-8.6-46.5-5.6c-3.6,0.7-5.4-1.1-5.9-4.4\n" +
    "	c-0.2-1.5-0.1-3-0.1-4.5C-546.8,152.7-546.8,132.9-546.8,113.1z M-526.4,142.5c-1.7,0-2.5,0-3.3,0c-3.2,0-6.4,0.2-6.5,4.3\n" +
    "	c-0.1,4.1,3,4.6,6.3,4.5c9.9-0.2,18.9,2.8,27.4,7.8c2.6,1.6,5.1,1.8,6.9-1c1.8-3,0.1-5-2.4-6.5C-507.1,146.2-516.7,143-526.4,142.5z\n" +
    "	 M-529.3,66.9c0.2,0-0.3,0-0.8,0c-3.1,0.2-6.3,0.6-6.1,4.8c0.2,3.9,3.2,4,6.2,4c9.7-0.1,18.6,2.8,26.9,7.7c2.6,1.6,5.4,2.5,7.4-0.7\n" +
    "	c2.1-3.3-0.1-5.2-2.7-6.8C-507.8,70.4-517.8,67.2-529.3,66.9z M-526.6,117.3c-1.8,0-2.6,0-3.5,0c-3.2,0-6.3,0.5-6.2,4.6\n" +
    "	c0.1,3.8,3,4.1,6.1,4.1c9.9,0,18.9,2.8,27.4,7.8c2.8,1.7,5.5,2,7.2-1.2c1.6-3.1-0.4-4.9-2.9-6.4C-507.4,121-517.1,117.7-526.6,117.3\n" +
    "	z M-527.2,92.3c-1.5,0-3-0.1-4.5,0c-2.9,0.2-5.2,1.8-4.4,4.7c0.4,1.6,3.1,3.7,4.7,3.7c10.3,0.1,19.7,2.8,28.5,8\n" +
    "	c2.8,1.6,5.5,2.1,7.3-1.1c1.7-3.1-0.4-5-2.9-6.4C-507.3,95.9-516.8,92.6-527.2,92.3z\"/>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<path d=\"M-391.9,156.9l-20,5c-1.1,0.3-2-0.5-1.7-1.7l5-20c0.4-1.5,2.2-2.3,3.1-1.4l15.1,15.1C-389.6,154.7-390.5,156.5-391.9,156.9\n" +
    "		z\"/>\n" +
    "	<path d=\"M-299.8,34.6l13.9,13.9c1.2,1.2,1.2,3.2,0,4.5l-5.9,5.9c-1.2,1.2-3.2,1.2-4.5,0l-13.9-13.9c-1.2-1.2-1.2-3.2,0-4.5l5.9-5.9\n" +
    "		C-303,33.3-301,33.3-299.8,34.6z\"/>\n" +
    "	<path d=\"M-384.3,150.6l85.5-85.5c1-1,1.2-2.5,0.5-3.2l-15.5-15.5c-0.8-0.8-2.2-0.5-3.2,0.5l-85.5,85.5c-1,1-1.2,2.5-0.5,3.2\n" +
    "		l15.5,15.5C-386.7,151.8-385.3,151.6-384.3,150.6z\"/>\n" +
    "</g>\n" +
    "<g>\n" +
    "	<path d=\"M-355.7,129.9c-0.6,0.6-0.9,1.3-0.9,2.1c0,19.4-0.1,38.8,0.1,58.1c0.1,5.5-1.4,7.1-7.1,7.5c-31.1,2-61.3,8.9-90.6,19.6\n" +
    "		c-3.8,1.4-7,1.5-10.9,0.1c-29.9-10.8-60.7-17.9-92.5-19.8c-4.3-0.3-5.5-1.7-5.5-5.7c0.1-52.7,0.1-105.5,0-158.2\n" +
    "		c0-4.5,1.6-6.1,6-6.1c30.5-0.2,60.1,4,88.6,15.5c4.1,1.7,4.5,4.1,4.5,7.9c-0.1,46.5-0.1,93.1-0.1,139.6c0,1.7-0.5,3.7,0.1,5.1\n" +
    "		c0.9,1.8,2.6,3.3,4,4.9c1.6-1.7,3.5-3.1,4.5-5c0.7-1.3,0.2-3.4,0.2-5.1c0-46.3,0.1-92.6-0.1-138.9c0-4.8,1.3-7,5.9-8.8\n" +
    "		c27.7-11.2,56.5-15,86.1-15.1c5.4,0,6.9,1.9,6.9,7.1c-0.1,9.7-0.2,33.9-0.2,39.7c0,0.8,0.9,1.3,1.5,0.8l21.8-20.9\n" +
    "		c0.7-0.5,1.1-1.3,1.1-2.1c0-11.1-0.9-11.6-13.4-13.1c0-2.8,0.1-5.7,0-8.6c-0.2-7.9-4-12.9-11.9-13.2c-11.7-0.5-23.5-0.2-35.3,0.7\n" +
    "		c-21.9,1.7-42.9,7.2-63.3,15.4c-2.4,1-5.9,0.5-8.4-0.5c-27.3-11.3-55.9-15.6-85.2-16.4c-3.6-0.1-7.3,0.1-10.9,0.6\n" +
    "		c-9.1,1.2-12.8,5.3-13,14.3c-0.1,2.5,0,5,0,7.7c-4.7,0.5-8.6,1-12.6,1.5v181.4c3.6,0.3,7.2,1,10.8,1c28.1,0.1,56.2-0.3,84.2,0.3\n" +
    "		c7.7,0.2,15.5,2.4,22.9,5c6,2.1,11.3,2.9,17.1,0c8.6-4.2,17.7-5.5,27.4-5.3c26.8,0.4,53.6,0.1,80.4,0.1c9.4,0,11.3-1.9,11.4-11.2\n" +
    "		c0-31.6-1.6-68.3-1.7-100.3c0-1.4-1.6-2-2.6-1.1C-341.7,115.3-352.5,126.8-355.7,129.9z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
}]);
