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

                let SESSION_DURATION = {
                    marginBeforeSessionStart: ENV.liveSession.marginBeforeSessionStart,
                    marginAfterSessionStart: ENV.liveSession.marginAfterSessionStart,
                    length: ENV.liveSession.sessionLength,
                    queryLessonStart: 4500000,
                    queryLessonEnd: 900000
                };
                let liveSessionSettingsProm = ZnkLessonNotesSrv.getLiveSessionSettings();
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
                                    this.getScheduledLesson().then(scheduledLesson => {
                                        LiveSessionUiSrv.closePopup();
                                        if (scheduledLesson) {
                                            LiveSessionSrv.startLiveSession(this.student, scheduledLesson);
                                        } else {
                                            LiveSessionUiSrv.showNoLessonScheduledPopup(this.student.name)
                                                .then(() => $log.debug('showSessionModal: No lesson is scheduled'));
                                        }
                                    });
                                } else {
                                    LiveSessionUiSrv.closePopup();
                                    this.showSessionModal();
                                }
                            });
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

                this.getScheduledLesson = () => {
                    let dataPromMap = {
                        liveSessionSettings: this.liveSessionSettings ? $q.when(this.liveSessionSettings) : liveSessionSettingsProm,
                        educatorProfile: this.educatorProfile ? $q.when(this.educatorProfile) : educatorProfileProm
                    };
                    return $q.all(dataPromMap).then(dataMap => {
                        this.liveSessionSettings = dataMap.liveSessionSettings;
                        this.educatorProfile = dataMap.educatorProfile;
                        SESSION_DURATION = this.liveSessionSettings ? this.liveSessionSettings : SESSION_DURATION;
                        let now = Date.now();
                        let calcStartTime = now - SESSION_DURATION.queryLessonStart;
                        let calcEndTime = now + SESSION_DURATION.length + SESSION_DURATION.queryLessonEnd;
                        let dateRange = {
                            startDate: calcStartTime,
                            endDate: calcEndTime
                        };

                        return ZnkLessonNotesSrv.getLessonsByStudentIds([this.student.uid], dateRange, this.educatorProfile.uid)
                            .then(lessons => {
                                return this.getLessonInRange(lessons.data);
                            }, err => $log.error('getScheduledLesson: getLessonsByStudentIds Error: ', err));
                    });


                };

                this.getLessonInRange = (lessons) => {
                    let scheduledLesson = null;
                    if (lessons && lessons.length > 0) {
                        if (lessons.length === 1) {
                            scheduledLesson = lessons.pop();
                        } else {
                            $log.debug(`getLessonInRange: multiple lesson - check if it's back to back`);
                            scheduledLesson = this.checkBack2BackLesson(lessons);
                        }
                    }
                    $log.debug(`getLessonInRange: lessons is not defined or lessons.length === 0 `);
                    return scheduledLesson;
                };

                this.checkBack2BackLesson = (lessons) => {
                    $log.debug(`checkBack2BackLesson`);
                    let scheduledLesson = null;
                    let back2BackLessons = [];
                    let now = Date.now();
                    lessons.forEach(lesson => {
                        let startTimeRange = lesson.date - SESSION_DURATION.marginBeforeSessionStart;
                        let endTimeRange = lesson.date + SESSION_DURATION.length + SESSION_DURATION.marginAfterSessionStart;
                        if ((startTimeRange < now < endTimeRange) && !scheduledLesson) {
                            scheduledLesson = lesson;
                            back2BackLessons.push(lesson);
                        } else if (scheduledLesson) {
                            if (back2BackLessons.length) {
                                if ((back2BackLessons[back2BackLessons.length-1].date + SESSION_DURATION.length) === lesson.date) {
                                    $log.debug(`checkBack2BackLesson: b2b lesson found. lessonId: ${lesson.id}`);
                                    back2BackLessons.push(lesson);
                                } else {
                                    $log.debug(`checkBack2BackLesson: this lesson isn't b2b lesson.`);
                                }
                            }
                        }
                    });

                    if (back2BackLessons.length > 1) {
                        let newB2BLessonId = UtilitySrv.general.createGuid();
                        let updateB2BLessonProms = [];
                        back2BackLessons.forEach(b2bLesson => {
                            b2bLesson.backToBackId = newB2BLessonId;
                            updateB2BLessonProms.push(ZnkLessonNotesSrv.updateLesson(b2bLesson));
                        });
                        Promise.all(updateB2BLessonProms)
                            .then(() => $log.debug(`checkBack2BackLesson: All back2backLesson are updated.`))
                            .catch((err) => $log.error('checkBack2BackLesson: Failed to update back2backLesson. Error: ', err));
                    }

                    return scheduledLesson;

                };
            }
        });
})(angular);
