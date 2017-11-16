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
                                  UserProfileService, LiveSessionUiSrv, StudentService) {
                'ngInject';

                let vm = this;
                let DOCUMENT_DB_QUERY_KEY = 'getLessonsByEducatorStudentStatusAndRange';
                let SESSION_DURATION = {
                    marginBeforeSessionStart: ENV.liveSession.marginBeforeSessionStart,
                    marginAfterSessionStart: ENV.liveSession.marginAfterSessionStart
                };
                let liveSessionDurationProm = ZnkLessonNotesSrv.getLiveSessionDuration();
                let educatorProfileProm = UserProfileService.getProfile();

                this.$onInit = function () {
                    vm.isLiveSessionActive = false;
                    vm.isOffline = true;
                    vm.isDiagnosticCompleted = false;
                    vm.endSession = endSession;
                    vm.showStartSessionPopup = showStartSessionPopup;
                    initializeLiveSessionStatus();

                    $scope.$watch('vm.student', newStudent => {
                        if (newStudent && angular.isDefined(newStudent.presence)) {
                            vm.isOffline = newStudent.presence === PresenceService.userStatus.OFFLINE;
                            StudentService.getStudentResults(newStudent.uid).then(studentResults => {
                                StudentService.isDiagnosticCompleted(studentResults.examResults)
                                    .then(isDiagnosticCompleted => vm.isDiagnosticCompleted = isDiagnosticCompleted);
                            });
                        }
                    }, true);

                    LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(liveSessionStateChanged);
                };

                function initializeLiveSessionStatus() {
                    LiveSessionSrv.getActiveLiveSessionData().then(liveSessionData => {
                        if (liveSessionData) {
                            liveSessionStateChanged(liveSessionData.status);
                        }
                    });
                }

                function showSessionModal() {
                    $mdDialog.show({
                        template: '<live-session-subject-modal student="vm.student"></live-session-subject-modal>',
                        scope: $scope,
                        preserveScope: true,
                        clickOutsideToClose: true
                    });
                }

                function showStartSessionPopup() {
                    if (!vm.isDiagnosticCompleted) {
                        $log.debug('showStartSessionPopup: Student didn\'t complete Diagnostic test');
                        return LiveSessionUiSrv.showIncompleteDiagnostic(vm.student.name);
                    }

                    LiveSessionUiSrv.showWaitPopUp();

                    UserProfileService.getCurrUserId().then(educatorId => {
                        LiveSessionUiSrv.isDarkFeaturesValid([educatorId, vm.student.uid])
                            .then(isDarkFeaturesValid => {
                                if (isDarkFeaturesValid) {
                                    $log.debug('darkFeatures in ON');
                                    getScheduledLesson().then(scheduledLesson => {
                                        LiveSessionUiSrv.closePopup();
                                        if (scheduledLesson) {
                                            LiveSessionSrv.startLiveSession(vm.student, scheduledLesson);
                                        } else {
                                            LiveSessionUiSrv.showNoLessonScheduledPopup(vm.student.name)
                                                .then(() => $log.debug('showSessionModal: No lesson is scheduled'));
                                        }
                                    });
                                } else {
                                    LiveSessionUiSrv.closePopup();
                                    showSessionModal();
                                }
                            });
                    });
                }

                function liveSessionStateChanged(newLiveSessionState) {
                    vm.isLiveSessionActive = newLiveSessionState === LiveSessionStatusEnum.CONFIRMED.enum;
                }

                function endSession() {
                    LiveSessionSrv.getActiveLiveSessionData().then(liveSessionData => {
                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                    });
                }


                function getScheduledLesson() {
                    let dataPromMap = {
                        liveSessionDuration: liveSessionDurationProm,
                        educatorProfile: educatorProfileProm
                    };
                    return $q.all(dataPromMap).then(dataMap => {
                        SESSION_DURATION = dataMap.liveSessionDuration ? dataMap.liveSessionDuration : SESSION_DURATION;
                        let now = Date.now();
                        let calcStartTime = now - SESSION_DURATION.marginBeforeSessionStart;
                        let calcEndTime = now + SESSION_DURATION.marginAfterSessionStart;
                        let query = {
                            query: DOCUMENT_DB_QUERY_KEY,
                            values: [
                                dataMap.educatorProfile.uid,
                                [vm.student.uid],
                                [LessonStatusEnum.SCHEDULED.enum],
                                calcStartTime,
                                calcEndTime
                            ]
                        };

                        return ZnkLessonNotesSrv.getLessonsByQuery(query).then(lessons => {
                            return lessons && lessons.length ? lessons[0] : null;
                        }, err => $log.debug('checkIfHaveScheduleLesson: getLessonsByQuery Error: ', err));
                    });


                }
            }
        });
})(angular);
