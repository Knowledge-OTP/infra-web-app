(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionUiSrv', function () {
        'ngInject';
        this.$get = function ($rootScope, $timeout, $compile, $animate, PopUpSrv, $translate, $q, $log, ENV,
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
                            translations.extendBtnTitle,
                            translations.cancelBtnTitle
                        );
                        return popUpInstance.promise
                            .then(res => $q.resolve(res))
                            .catch(err => $q.reject(err));
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
        };
    });
})(angular);
