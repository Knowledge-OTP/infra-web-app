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
                                  PresenceService, ENV, LiveSessionStatusEnum, ZnkLessonNotesSrv, LessonStatusEnum, UserProfileService) {
                'ngInject';

                let vm = this;
                let DOCUMENT_DB_QUERY_KEY = 'getLessonsByEducatorStudentStatusAndRange';
                let SESSION_DURATION =  {
                    marginBeforeSessionStart: ENV.liveSession.marginBeforeSessionStart,
                    marginAfterSessionStart: ENV.liveSession.marginAfterSessionStart
                };
                let dataPromMap = {
                    liveSessionDuration: ZnkLessonNotesSrv.getLiveSessionDuration(),
                    educatorId: UserProfileService.getCurrUserId(),
                };

                this.$onInit = function() {
                    vm.isLiveSessionActive = false;
                    vm.isOffline = true;
                    vm.endSession = endSession;
                    vm.showSessionModal = showSessionModal;
                    initializeLiveSessionStatus();

                    $scope.$watch('vm.student', function (newStudent) {
                        if (newStudent && angular.isDefined(newStudent.presence)) {
                            vm.isOffline = newStudent.presence === PresenceService.userStatus.OFFLINE;
                        }
                    }, true);

                    LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(liveSessionStateChanged);
                };

                function initializeLiveSessionStatus() {
                    LiveSessionSrv.getActiveLiveSessionData().then(function (liveSessionData) {
                        if (liveSessionData) {
                            liveSessionStateChanged(liveSessionData.status);
                        }
                    });
                }

                function showSessionModal() {
                    getScheduledLesson().then(scheduledLesson => {
                        if (scheduledLesson) {
                            vm.lessonId = scheduledLesson.id;
                            $mdDialog.show({
                                template: '<live-session-subject-modal student="vm.student" lesson-id="vm.lessonId"></live-session-subject-modal>',
                                scope: $scope,
                                preserveScope: true,
                                clickOutsideToClose: true
                            });
                        } else {
                            $log.debug('showSessionModal: No lesson is scheduled');
                        }
                    });
                }
                function liveSessionStateChanged(newLiveSessionState) {
                    vm.isLiveSessionActive = newLiveSessionState === LiveSessionStatusEnum.CONFIRMED.enum;
                }
                function endSession() {
                    LiveSessionSrv.getActiveLiveSessionData().then(function (liveSessionData) {
                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                    });
                }


                function getScheduledLesson() {
                    return $q.all(dataPromMap).then(dataMap => {
                        SESSION_DURATION = dataMap.liveSessionDuration ? dataMap.liveSessionDuration : SESSION_DURATION;
                        let now = Date.now();
                        let calcStartTime = now - SESSION_DURATION.marginBeforeSessionStart;
                        let calcEndTime = now + SESSION_DURATION.marginAfterSessionStart;
                        let query = {
                            query: DOCUMENT_DB_QUERY_KEY,
                            values: [
                                dataMap.educatorId,
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
