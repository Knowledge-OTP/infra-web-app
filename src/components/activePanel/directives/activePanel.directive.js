
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

          var durationToDisplay,
            timerInterval,
            liveSessionData,
            liveSessionStatus = 0,
            liveSessionDuration = 0,
            timerSecondInterval = 1000,
            activePanelVisibleClassName = 'activePanel-visible',
            isStudent = ENV.appContext.toLowerCase() === 'student',
            isTeacher = ENV.appContext.toLowerCase() === 'dashboard',
            prevLiveSessionStatus = UserLiveSessionStateEnum.NONE.enum,
            bodyDomElem = angular.element($window.document.body),
            translateNamespace = 'ACTIVE_PANEL';
          const hangoutsUrl = 'https://hangouts.google.com/call/';

          $translate([
            translateNamespace + '.' + 'SHOW_STUDENT_SCREEN',
            translateNamespace + '.' + 'SHOW_TEACHER_SCREEN',
            translateNamespace + '.' + 'SHARE_MY_SCREEN',
            translateNamespace + '.' + 'END_SCREEN_SHARING'
          ]).then(function (translation) {
            scope.d.translatedStrings = {
              SHOW_STUDENT_SCREEN: translation[translateNamespace + '.' + 'SHOW_STUDENT_SCREEN'],
              SHOW_TEACHER_SCREEN: translation[translateNamespace + '.' + 'SHOW_TEACHER_SCREEN'],
              SHARE_MY_SCREEN: translation[translateNamespace + '.' + 'SHARE_MY_SCREEN'],
              END_SCREEN_SHARING: translation[translateNamespace + '.' + 'END_SCREEN_SHARING']
            };
          }).catch(function (err) {
            $log.debug('Could not fetch translation', err);
          });

          UserProfileService.getProfile().then(function (userProfile) {
            scope.d.userProfile = userProfile;
          });

          function endLiveSession() {
            if (liveSessionData) {
              deleteStudentPath(liveSessionData.studentId);
              LiveSessionSrv.endLiveSession(liveSessionData.guid);
            } else {
              LiveSessionSrv.getActiveLiveSessionData().then(function (liveSessionData) {
                if (liveSessionData) {
                  deleteStudentPath(liveSessionData.studentId);
                  LiveSessionSrv.endLiveSession(liveSessionData.guid);
                }
              });
            }
          }

          function startTimer() {
            $log.debug('call timer started');
            timerInterval = $interval(function () {
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
              ScreenSharingSrv.getActiveScreenSharingData().then(function (screenSharingData) {
                if (screenSharingData) {
                  ScreenSharingSrv.endSharing(screenSharingData.guid);
                }
              });
            }
          }

          function updateStatus() {
            scope.d.currStatus = liveSessionStatus;
            $log.debug('ActivePanel d.currStatus: ', scope.d.currStatus);

            switch (scope.d.currStatus) {
              case scope.d.states.NONE:
                $log.debug('ActivePanel State: NONE');
                bodyDomElem.removeClass(activePanelVisibleClassName);
                scope.d.shareScreenBtnsEnable = true;
                destroyTimer();
                endScreenSharing();
                break;
              case scope.d.states.LIVE_SESSION:
                $log.debug('ActivePanel State: LIVE_SESSION');
                bodyDomElem.addClass(activePanelVisibleClassName);
                startTimer();
                break;
              default:
                $log.error('currStatus is in an unknown state', scope.d.currStatus);
            }
          }

          function getRoundTime() {
            return Math.floor(Date.now() / 1000) * 1000;
          }

          function trackUserPresenceCB(userId, newStatus) {
            scope.d.currentUserPresenceStatus = newStatus;

            CallsUiSrv.getCalleeName(userId).then(function (calleeName) {
              scope.d.calleeName = calleeName;
              scope.d.callBtnModel = {
                isOffline: scope.d.currentUserPresenceStatus === PresenceService.userStatus.OFFLINE,
                receiverId: userId
              };
            });
          }

          function openHangouts() {
            NavigationService.navigateToUrl(hangoutsUrl, scope.d.userProfile.teacherInfo.hangoutsUri);
            LiveSessionSrv.getActiveLiveSessionData().then(function (newLiveSessionData) {
              if (!liveSessionData || !angular.equals(liveSessionData, newLiveSessionData)) {
                liveSessionData = newLiveSessionData;
              }
              const hangoutUri = hangoutsUrl + scope.d.userProfile.teacherInfo.hangoutsUri;
              return writeToStudentPath(liveSessionData.studentId, hangoutUri);
              // HangoutsService.sendInvitation(liveSessionData.studentId, liveSessionData.educatorId);
            });
          }

          function writeToStudentPath(studentId, hangoutsUri) {
            InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
              const studentHangoutsPath = getHangoutsSessionRoute(studentId);
              return studentStorage.set(studentHangoutsPath, hangoutsUri);
            });
          }

          function deleteStudentPath(studentId) {
            InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
              const studentHangoutsPath = getHangoutsSessionRoute(studentId);
              return studentStorage.update(studentHangoutsPath, null);
            });

          }
          function getHangoutsSessionRoute(studentId) {
            return '/users/' + studentId + '/hangoutsSession';
          }


          function listenToLiveSessionStatus(newLiveSessionStatus) {
            if (prevLiveSessionStatus !== newLiveSessionStatus) {
              prevLiveSessionStatus = newLiveSessionStatus;
              LiveSessionSrv.getActiveLiveSessionData().then(function (newLiveSessionData) {
                if (!liveSessionData || !angular.equals(liveSessionData, newLiveSessionData)) {
                  liveSessionData = newLiveSessionData;
                }

                if (isTeacher) {
                  PresenceService.startTrackUserPresence(liveSessionData.studentId, trackUserPresenceCB.bind(null, liveSessionData.studentId));
                } else if (isStudent) {
                  PresenceService.startTrackUserPresence(liveSessionData.educatorId, trackUserPresenceCB.bind(null, liveSessionData.educatorId));
                } else {
                  $log.error('listenToLiveSessionStatus appContext is not compatible with this component: ', ENV.appContext);
                }

                var isEnded = liveSessionData.status === LiveSessionStatusEnum.ENDED.enum;
                var isConfirmed = liveSessionData.status === LiveSessionStatusEnum.CONFIRMED.enum;
                if (isEnded || isConfirmed) {
                  if (isConfirmed) {
                    liveSessionStatus = scope.d.states.LIVE_SESSION;
                    liveSessionDuration = getRoundTime() - liveSessionData.startTime;
                  } else {
                    liveSessionStatus = scope.d.states.NONE;
                  }
                  updateStatus();
                }
              });
            }
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
            var sharerData = {
              isTeacher: !isTeacher,
              uid: isTeacher ? liveSessionData.studentId : liveSessionData.educatorId
            };
            $log.debug('viewOtherUserScreen: ', sharerData);
            ScreenSharingSrv.viewOtherUserScreen(sharerData);
          }

          function shareMyScreen() {
            var viewerData = {
              isTeacher: !isTeacher,
              uid: isTeacher ? liveSessionData.studentId : liveSessionData.educatorId
            };
            $log.debug('shareMyScreen: ', viewerData);
            ScreenSharingSrv.shareMyScreen(viewerData);
          }


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

          element.on('$destroy', function () {
            destroyTimer();
          });

          function listenToCallsStatus(newCallsStatus) {
            scope.d.disableAllBtns = newCallsStatus && newCallsStatus.status === CallsStatusEnum.PENDING_CALL.enum;
          }

          ScreenSharingSrv.registerToCurrUserScreenSharingStateChanges(listenToScreenShareStatus);

          LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(listenToLiveSessionStatus);

          CallsEventsSrv.registerToCurrUserCallStateChanges(listenToCallsStatus);
        }
      };
    });
})(angular);
