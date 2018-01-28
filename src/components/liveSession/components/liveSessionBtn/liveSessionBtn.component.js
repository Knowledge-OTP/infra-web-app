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
                                  UserProfileService, LiveSessionUiSrv, StudentService, UtilitySrv, LessonNotesStatusEnum,
                                  ZnkLessonNotesUiSrv) {
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
                    // Live session btn, click on it will start all the flow
                    this.isLiveSessionActive = false;
                    this.isOffline = true;
                    this.isDiagnosticCompleted = false;
                    this.initializeLiveSessionStatus();

                    // Watch on student presences to enable/disable the live session btn on the educator client
                    $scope.$watch('vm.student', newStudent => {
                        if (newStudent && angular.isDefined(newStudent.presence)) {
                            this.isOffline = newStudent.presence === PresenceService.userStatus.OFFLINE;
                            StudentService.getStudentResults(newStudent.uid).then(studentResults => {
                                StudentService.isDiagnosticCompleted(studentResults.examResults)
                                    .then(isDiagnosticCompleted => this.isDiagnosticCompleted = isDiagnosticCompleted);
                            });
                        }
                    }, true);
                    // Watch live session state changes to change the live session btn activity (Start Session/End Session)
                    LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(this.liveSessionStateChanged);
                };

                // handel the live session btn state in case on browser refresh/reload
                this.initializeLiveSessionStatus = () => {
                    //
                    LiveSessionSrv.getActiveLiveSessionData().then(liveSessionData => {
                        if (liveSessionData) {
                            this.liveSessionStateChanged(liveSessionData.status);
                        }
                    });
                };

                // Show the topic modal to select topic in case we don't have dark lunch
                this.showSessionModal = () => {
                    $mdDialog.show({
                        template: '<live-session-subject-modal student="vm.student"></live-session-subject-modal>',
                        scope: $scope,
                        preserveScope: true,
                        clickOutsideToClose: true
                    });
                };

                // click on start session execute this fn
                this.showStartSessionPopup = () => {
                    if (!this.isDiagnosticCompleted) {
                        $log.debug('showStartSessionPopup: Student didn\'t complete Diagnostic test');
                        return LiveSessionUiSrv.showIncompleteDiagnostic(this.student.name);
                    }

                    // show wait popup to the educator while dark lunch check and getting the schedule lessons
                    LiveSessionUiSrv.showWaitPopUp();

                    UserProfileService.getCurrUserId().then(educatorId => {
                        // check if there is dark lunch in both educator and student
                        LiveSessionUiSrv.isDarkFeaturesValid(educatorId, this.student.uid)
                            .then(isDarkFeaturesValid => {
                                if (isDarkFeaturesValid) {
                                    $log.debug('darkFeatures in ON');
                                    this.getScheduledLessons().then(scheduledLessonData => {
                                        LiveSessionUiSrv.closePopup();
                                        if (scheduledLessonData) {
                                            // continue with saving the liveSession in db
                                            LiveSessionSrv.startLiveSession(this.student, scheduledLessonData);
                                        } else {
                                            LiveSessionUiSrv.showNoLessonScheduledPopup(this.student.name)
                                                .then(() => $log.debug('showSessionModal: No lesson is scheduled'));
                                        }
                                    });
                                } else {
                                    // close the wait popup and open the topic select modal
                                    LiveSessionUiSrv.closePopup();
                                    this.showSessionModal();
                                }
                            }).catch(err => {
                            $log.error('isDarkFeaturesValid Error: ', err);
                            LiveSessionUiSrv.errorPopup();
                        });
                    });
                };

                // change the live session btn activity (Start Session/End Session)
                this.liveSessionStateChanged = (newLiveSessionState) => {
                    this.isLiveSessionActive = newLiveSessionState === LiveSessionStatusEnum.CONFIRMED.enum;
                };

                // click on start session execute this fn
                this.endSession = () => {
                    LiveSessionSrv.getActiveLiveSessionData().then(liveSessionData => {
                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                    });
                };

                // get the schedule lessons between range of (now - 75 min) and (now + 4 hours)
                this.getScheduledLessons = () => {
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
                        let lessonStatusList = [
                            LessonStatusEnum.SCHEDULED.enum,
                            LessonStatusEnum.ATTENDED.enum,
                            LessonStatusEnum.MISSED.enum
                        ];

                        return ZnkLessonNotesSrv.getLessonsByStudentIds([this.student.uid], dateRange, this.educatorProfile.uid, lessonStatusList)
                            .then(lessons => {
                                let lessonToReturn = null;
                                if (lessons && lessons.length) {
                                    lessons.sort(UtilitySrv.array.sortByField('date'));
                                    lessonToReturn = this.getLessonInRange(lessons);
                                }
                                return lessonToReturn;
                            }, err => {
                                $log.error('getScheduledLesson: getLessonsByStudentIds Error: ', err);
                                LiveSessionUiSrv.errorPopup();
                            });
                    });


                };

                // check if the lessons schedule for now (now > lesson.date - 5 min) and (now < lesson.date + 60 min + 15 min) return boolean
                this.isLessonInRange = (lesson) => {
                    const now = Date.now();
                    const startTimeRange = lesson.date - SESSION_SETTINGS.marginBeforeSessionStart;
                    const endTimeRange = lesson.date + SESSION_SETTINGS.length + SESSION_SETTINGS.marginAfterSessionStart;
                    return (now > startTimeRange && now < endTimeRange);
                };

                // check if the lessons schedule for now (now > lesson.date - 5 min) and (now < lesson.date + 60 min + 15 min)
                this.getLessonInRange = (lessons) => {
                    let scheduledLessonMap = null;
                    if (lessons && lessons.length > 0) {
                        // No multiple lesson return single lesson
                        if (lessons.length === 1) {
                            let lesson = lessons.pop();
                            scheduledLessonMap = this.isLessonInRange(lesson) ? this.getScheduledLessonMapFromSingleLesson(lesson) : null;
                        } else {
                            $log.debug(`getLessonInRange: multiple lesson - check if it's back to back`);
                            scheduledLessonMap = this.checkBack2BackLesson(lessons);
                        }
                    }
                    $log.debug(`getLessonInRange: lessons is not defined or lessons.length === 0 `);
                    return scheduledLessonMap;
                };

                this.getScheduledLessonMapFromSingleLesson = (lesson) => {
                    let scheduledLessonMap = {};
                    if (!lesson.lessonSummaryId) {
                        // add lessonSummaryId to scheduledLesson if there isn't
                        const newLessonSummary = ZnkLessonNotesUiSrv.newLessonSummary();
                        lesson.lessonSummaryId = newLessonSummary.id;
                        ZnkLessonNotesSrv.saveLessonSummary(newLessonSummary)
                            .then('getLessonInRange: saveLessonSummary: new lesson summary saved. id: ', newLessonSummary.id)
                            .catch('getLessonInRange: saveLessonSummary: Failed to save LessonSummary. id: ', newLessonSummary.id);
                        ZnkLessonNotesSrv.updateLesson(lesson)
                            .then('getLessonInRange: updateLesson: update Lesson successfully. id: ', lesson.id)
                            .catch('getLessonInRange: updateLesson: Failed to update Lesson. id: ', lesson.id);
                    }

                    scheduledLessonMap.scheduledLesson = lesson;
                    scheduledLessonMap.expectedSessionEndTime = scheduledLessonMap.scheduledLesson.date + SESSION_SETTINGS.length;
                    return scheduledLessonMap;
                };

                // multiple lessons -  check if there back to back lesson (double lesson)
                this.checkBack2BackLesson = (lessons) => {
                    $log.debug(`checkBack2BackLesson`);
                    let scheduledLessonMap = {};
                    let back2BackLessons = [];
                    let now = Date.now();
                    // get the first scheduledLesson that is in range from all the query lessons
                    lessons.forEach(lesson => {
                        if (this.isLessonInRange(lesson) && !scheduledLessonMap.scheduledLesson) {
                            scheduledLessonMap = this.getScheduledLessonMapFromSingleLesson(lesson);
                            back2BackLessons.push(lesson);
                        } else if (scheduledLessonMap.scheduledLesson) {
                            // must be second iteration or above
                            if ((back2BackLessons[back2BackLessons.length - 1].date + SESSION_SETTINGS.length) === lesson.date) {
                                $log.debug(`checkBack2BackLesson: b2b lesson found. lessonId: ${lesson.id}`);
                                // scenario when the second lesson in the array is the actual scheduledLesson and not the first one
                                if (lesson.date < now) {
                                    back2BackLessons.pop();
                                    scheduledLessonMap = this.getScheduledLessonMapFromSingleLesson(lesson);
                                }
                                back2BackLessons.push(lesson);
                            } else {
                                $log.debug(`checkBack2BackLesson: this lesson isn't b2b lesson.`);
                            }
                        }
                    });

                    if (back2BackLessons.length > 1) {
                        this.checkLessonForBackToBackId(back2BackLessons);
                    } else {
                        $log.debug(`checkBack2BackLesson: no back2back lesson, just single scheduledLesson`);
                    }

                    return scheduledLessonMap;
                };

                // add backToBackId for backToBack lessons if they don't have
                this.checkLessonForBackToBackId = (back2BackLessons) => {
                    // I am assuming that if the first lesson have backToBackId, so they all have
                    if (!back2BackLessons[0].backToBackId) {
                        let newB2BLessonId = UtilitySrv.general.createGuid();
                        let updateB2BLessonProms = [];
                        back2BackLessons.forEach(b2bLesson => {
                            if (!b2bLesson.lessonSummaryId) {
                                // add lessonSummaryId to scheduledLesson or all back2BackLessons if there isn't
                                const newLessonSummary = ZnkLessonNotesUiSrv.newLessonSummary();
                                b2bLesson.lessonSummaryId = newLessonSummary.id;
                                ZnkLessonNotesSrv.saveLessonSummary(newLessonSummary)
                                    .then('checkBack2BackLesson: saveLessonSummary: new lesson summary saved. id: ', newLessonSummary.id)
                                    .catch('checkBack2BackLesson: saveLessonSummary: Failed to save LessonSummary. id: ', newLessonSummary.id);
                            }
                            b2bLesson.backToBackId = newB2BLessonId;
                            updateB2BLessonProms.push(ZnkLessonNotesSrv.updateLesson(b2bLesson));
                        });
                        Promise.all(updateB2BLessonProms)
                            .then(() => $log.debug(`checkBack2BackLesson: All back2backLesson are updated.`))
                            .catch((err) => $log.error('checkBack2BackLesson: Failed to update back2backLesson. Error: ', err));
                    } else {
                        $log.debug(`checkBack2BackLesson: back2BackLessons[0] all ready have backToBackId`);
                    }
                };

            }
        });
})(angular);
