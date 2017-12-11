(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession')
        .component('liveSessionBtn', {
            bindings: {
                student: '='
            },
            templateUrl: 'components/liveSession/components/liveSessionBtn/liveSessionBtn.template.html',
            controllerAs: 'vm',
            controller: function ($q, $log, $scope, $mdDialog, LiveSessionSrv, StudentContextSrv, TeacherContextSrv,
                                  PresenceService, ENV, LiveSessionStatusEnum, ZnkLessonNotesSrv, LessonStatusEnum,
                                  UserProfileService, LiveSessionUiSrv, StudentService, UtilitySrv) {
                'ngInject';

                let SESSION_SETTINGS = {
                    marginBeforeSessionStart: ENV.liveSession.marginBeforeSessionStart,
                    marginAfterSessionStart: ENV.liveSession.marginAfterSessionStart,
                    length: ENV.liveSession.length,
                    queryLessonStart: ENV.liveSession.queryLessonStart,
                };
                let queryLessonNum = 4; // multiple this number by the lesson length for the getScheduledLesson query
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
                        let calcEndTime = now + (SESSION_SETTINGS.length * queryLessonNum);
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

                    if (back2BackLessons.length > 1) {
                        if (!back2BackLessons[0].backToBackId) {
                            let newB2BLessonId = UtilitySrv.general.createGuid();
                            let updateB2BLessonProms = [];
                            back2BackLessons.forEach(b2bLesson => {
                                b2bLesson.backToBackId = newB2BLessonId;
                                updateB2BLessonProms.push(ZnkLessonNotesSrv.updateLesson(b2bLesson));
                            });
                            Promise.all(updateB2BLessonProms)
                                .then(() => $log.debug(`checkBack2BackLesson: All back2backLesson are updated.`))
                                .catch((err) => $log.error('checkBack2BackLesson: Failed to update back2backLesson. Error: ', err));
                        } else {
                            $log.debug(`checkBack2BackLesson: back2BackLessons[0] al ready have backToBackId`);
                        }
                    } else {
                        $log.debug(`checkBack2BackLesson: back2BackLessons.length === 0`);
                    }

                    return scheduledLessonMap;

                };
            }
        });
})(angular);
