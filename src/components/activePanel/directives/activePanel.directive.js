(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.activePanel')
        .directive('activePanel',
            function ($window, $q, $interval, $filter, $log, CallsUiSrv, ScreenSharingSrv,
                      PresenceService, StudentContextSrv, TeacherContextSrv, ENV,
                      $translate, LiveSessionSrv, LiveSessionStatusEnum,
                      UserScreenSharingStateEnum, UserLiveSessionStateEnum,
                      CallsEventsSrv, CallsStatusEnum, NavigationService,
                      UserProfileService, HangoutsService, InfraConfigSrv) {
                'ngInject';
                return {
                    templateUrl: 'components/activePanel/directives/activePanel.template.html',
                    scope: {},
                    link: function (scope, element) {

                        const timerSecondInterval = 1000;
                        const activePanelVisibleClassName = 'activePanel-visible';
                        const isStudent = ENV.appContext.toLowerCase() === 'student';
                        const isTeacher = ENV.appContext.toLowerCase() === 'dashboard';
                        let durationToDisplay;
                        let timerInterval;
                        let liveSessionData;
                        let liveSessionDuration = 0;
                        let prevLiveSessionStatus = UserLiveSessionStateEnum.NONE.enum;


                        activePanelInit();

                        function activePanelInit() {
                            scope.d = {
                                states: {
                                    NONE: 0,
                                    LIVE_SESSION: 1
                                },
                                shareScreenBtnsEnable: true,
                                disableAllBtns: false,
                                isTeacher: isTeacher,
                                presenceStatusMap: PresenceService.userStatus,
                                endScreenSharing: endScreenSharing,
                                endSession: endLiveSession,
                                viewOtherUserScreen: viewOtherUserScreen,
                                shareMyScreen: shareMyScreen,
                                openHangouts: openHangouts
                            };

                            getTranslations();

                            UserProfileService.getProfile().then(userProfile => scope.d.userProfile = userProfile);

                            ScreenSharingSrv.registerToCurrUserScreenSharingStateChanges(listenToScreenShareStatus);

                            LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(listenToLiveSessionStatus);

                            CallsEventsSrv.registerToCurrUserCallStateChanges(listenToCallsStatus);

                            element.on('$destroy', () => {
                                destroyTimer();
                                stopTrackUserPresence();
                                ScreenSharingSrv.unregisterFromCurrUserScreenSharingStateChanges(listenToScreenShareStatus);
                                LiveSessionSrv.unregisterFromCurrUserLiveSessionStateChanges(listenToLiveSessionStatus);
                                CallsEventsSrv.unregisterToCurrUserCallStateChanges(listenToCallsStatus);
                            });

                        }

                        function getTranslations() {
                            const translateNamespace = 'ACTIVE_PANEL';
                            $translate([
                                `${translateNamespace}.SHOW_STUDENT_SCREEN`,
                                `${translateNamespace}.SHOW_TEACHER_SCREEN`,
                                `${translateNamespace}.SHARE_MY_SCREEN`,
                                `${translateNamespace}.END_SCREEN_SHARING`
                            ]).then(translation => {
                                scope.d.translatedStrings = {
                                    SHOW_STUDENT_SCREEN: translation[`${translateNamespace}.SHOW_STUDENT_SCREEN`],
                                    SHOW_TEACHER_SCREEN: translation[`${translateNamespace}.SHOW_TEACHER_SCREEN`],
                                    SHARE_MY_SCREEN: translation[`${translateNamespace}.SHARE_MY_SCREEN`],
                                    END_SCREEN_SHARING: translation[`${translateNamespace}.END_SCREEN_SHARING`]
                                };
                            }).catch(err => {
                                $log.debug('Could not fetch translation', err);
                            });
                        }

                        function endLiveSession() {
                            if (liveSessionData) {
                                LiveSessionSrv.endLiveSession(liveSessionData.guid);
                            } else {
                                LiveSessionSrv.getActiveLiveSessionData().then(liveSessionData => {
                                    if (liveSessionData) {
                                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                                    }
                                });
                            }
                        }

                        function startTimer() {
                            $log.debug('call timer started');
                            timerInterval = $interval(() => {
                                liveSessionDuration += timerSecondInterval;
                                durationToDisplay = $filter('formatDuration')(liveSessionDuration / 1000, 'hh:MM:SS', true);
                                angular.element(element[0].querySelector('.live-session-duration')).text(durationToDisplay);
                            }, 1000, 0, false);
                        }

                        function destroyTimer() {
                            $interval.cancel(timerInterval);
                            liveSessionDuration = 0;
                            durationToDisplay = 0;
                        }

                        function endScreenSharing() {
                            if (scope.d.screenShareStatus !== UserScreenSharingStateEnum.NONE.enum) {
                                ScreenSharingSrv.getActiveScreenSharingData().then(screenSharingData => {
                                    if (screenSharingData) {
                                        ScreenSharingSrv.endSharing(screenSharingData.guid);
                                    }
                                });
                            }
                        }

                        function updateStatus(newLiveSessionStatus) {
                            scope.d.currStatus = newLiveSessionStatus;
                            $log.debug('ActivePanel d.currStatus: ', scope.d.currStatus);
                            const bodyDomElem = angular.element($window.document.body);

                            switch (scope.d.currStatus) {
                                case scope.d.states.NONE:
                                    $log.debug('ActivePanel State: NONE');
                                    bodyDomElem.removeClass(activePanelVisibleClassName);
                                    scope.d.shareScreenBtnsEnable = true;
                                    destroyTimer();
                                    endScreenSharing();
                                    stopTrackUserPresence();
                                    deleteStudentHangoutsPath(liveSessionData.studentId);
                                    break;
                                case scope.d.states.LIVE_SESSION:
                                    $log.debug('ActivePanel State: LIVE_SESSION');
                                    bodyDomElem.addClass(activePanelVisibleClassName);
                                    liveSessionDuration = getRoundTime() - liveSessionData.startTime;
                                    startTrackUserPresence();
                                    getCalleeName();
                                    startTimer();
                                    break;
                                default:
                                    $log.error('currStatus is in an unknown state', scope.d.currStatus);
                            }
                        }

                        function getRoundTime() {
                            return Math.floor(Date.now() / 1000) * 1000;
                        }

                        function getCalleeName() {
                            const uid = isTeacher ? liveSessionData.studentId : liveSessionData.educatorId;
                            CallsUiSrv.getCalleeName(uid).then(calleeName => {
                                scope.d.calleeName = calleeName;
                                scope.d.callBtnModel = {
                                    isOffline: scope.d.currentUserPresenceStatus === PresenceService.userStatus.OFFLINE,
                                    receiverId: uid
                                };
                            });
                        }

                        function openHangouts() {
                            if (scope.d.userProfile && scope.d.userProfile.teacherInfo && scope.d.userProfile.teacherInfo.hangoutsUri) {
                                NavigationService.navigateToUrl(scope.d.userProfile.teacherInfo.hangoutsUri);
                                LiveSessionSrv.getActiveLiveSessionData().then(newLiveSessionData => {
                                    if (!liveSessionData || !angular.equals(liveSessionData, newLiveSessionData)) {
                                        liveSessionData = newLiveSessionData;
                                    }
                                    return writeToStudentPath(liveSessionData.studentId, scope.d.userProfile);
                                });
                            }
                        }

                        function writeToStudentPath(studentId, educatorProfile) {
                            InfraConfigSrv.getStudentStorage().then(studentStorage => {
                                const studentHangoutsPath = getHangoutsSessionRoute(studentId);
                                const email = educatorProfile.authEmail || educatorProfile.email;
                                const hangoutsUri = educatorProfile.teacherInfo.hangoutsUri;

                                return studentStorage.set(studentHangoutsPath, { email, hangoutsUri });
                            });
                        }

                        function deleteStudentHangoutsPath(studentId) {
                            if (studentId) {
                                InfraConfigSrv.getStudentStorage().then(studentStorage => {
                                    const studentHangoutsPath = getHangoutsSessionRoute(studentId);
                                    return studentStorage.update(studentHangoutsPath, null);
                                });
                            } else {
                                $log.debug('deleteStudentHangoutsPath: studentId is required');
                            }

                        }

                        function getHangoutsSessionRoute(studentId) {
                            return '/users/' + studentId + '/hangoutsSession';
                        }

                        function listenToLiveSessionStatus(newLiveSessionStatus) {
                            if (prevLiveSessionStatus !== newLiveSessionStatus) {
                                prevLiveSessionStatus = newLiveSessionStatus;
                                LiveSessionSrv.getActiveLiveSessionData().then(newLiveSessionData => {
                                    if (!liveSessionData || !angular.equals(liveSessionData, newLiveSessionData)) {
                                        liveSessionData = newLiveSessionData;
                                    }

                                    const isEnded = liveSessionData.status === LiveSessionStatusEnum.ENDED.enum;
                                    const isConfirmed = liveSessionData.status === LiveSessionStatusEnum.CONFIRMED.enum;
                                    if (isEnded || isConfirmed) {
                                        const newLiveSessionStatus = isConfirmed ? scope.d.states.LIVE_SESSION : scope.d.states.NONE;
                                        updateStatus(newLiveSessionStatus);
                                    }
                                });
                            }
                        }

                        function startTrackUserPresence() {
                            if (isStudent || isTeacher) {
                                // Track other user presence
                                const uid = isTeacher ? liveSessionData.studentId : liveSessionData.educatorId;
                                PresenceService.startTrackUserPresence(uid, (newStatus) => scope.d.currentUserPresenceStatus = newStatus);
                            }
                            else {
                                $log.error('listenToLiveSessionStatus appContext is not compatible with this component: ', ENV.appContext);
                            }
                        }

                        function stopTrackUserPresence() {
                            PresenceService.stopTrackUserPresence(liveSessionData.studentId);
                            PresenceService.stopTrackUserPresence(liveSessionData.educatorId);
                        }

                        // Listen to status changes in ScreenSharing
                        function listenToScreenShareStatus(screenSharingStatus) {
                            if (screenSharingStatus) {
                                if (screenSharingStatus !== UserScreenSharingStateEnum.NONE.enum) {
                                    scope.d.screenShareStatus = screenSharingStatus;
                                    scope.d.shareScreenBtnsEnable = false;
                                    scope.d.shareScreenViewer = (screenSharingStatus === UserScreenSharingStateEnum.VIEWER.enum);
                                } else {
                                    scope.d.screenShareStatus = UserScreenSharingStateEnum.NONE.enum;
                                    scope.d.shareScreenBtnsEnable = true;
                                }
                            }
                        }

                        function viewOtherUserScreen() {
                            const sharerData = {
                                isTeacher: !isTeacher,
                                uid: isTeacher ? liveSessionData.studentId : liveSessionData.educatorId
                            };
                            $log.debug('viewOtherUserScreen: ', sharerData);
                            ScreenSharingSrv.viewOtherUserScreen(sharerData);
                        }

                        function shareMyScreen() {
                            const viewerData = {
                                isTeacher: !isTeacher,
                                uid: isTeacher ? liveSessionData.studentId : liveSessionData.educatorId
                            };
                            $log.debug('shareMyScreen: ', viewerData);
                            ScreenSharingSrv.shareMyScreen(viewerData);
                        }


                        function listenToCallsStatus(newCallsStatus) {
                            scope.d.disableAllBtns = newCallsStatus && newCallsStatus.status === CallsStatusEnum.PENDING_CALL.enum;
                        }
                    }
                };
            });
})(angular);
