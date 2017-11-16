(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionUiSrv',function(){

        this.$get = function ($rootScope, $timeout, $compile, $animate, PopUpSrv, $translate, $q, $log, ENV,
                              ZnkToastSrv, LiveSessionDataGetterSrv, UserProfileService) {
            'ngInject';

            let childScope, liveSessionPhElement, readyProm;
            let LiveSessionUiSrv = {};
            let darkFeaturesValid  = null;

            let SESSION_DURATION =  {
                length: ENV.liveSession.sessionLength,
                extendTime: ENV.liveSession.sessionExtendTime,
                endAlertTime: ENV.liveSession.sessionEndAlertTime
            };

            function _init() {
                let bodyElement = angular.element(document.body);

                liveSessionPhElement = angular.element('<div class="live-session-ph"></div>');

                bodyElement.append(liveSessionPhElement);

                //load liveSessionDuration from firebase
                LiveSessionDataGetterSrv.getLiveSessionDuration().then(function (liveSessionDuration) {
                    if (liveSessionDuration) {
                        SESSION_DURATION = liveSessionDuration;
                    }
                },function(err){
                    $log.error('LiveSessionUiSrv: getLiveSessionDuration failure' + err);
                });
            }

            function _endLiveSession() {
                if(childScope){
                    childScope.$destroy();
                }

                if(liveSessionPhElement){
                    let hasContents = !!liveSessionPhElement.contents().length;
                    if(hasContents){
                        $animate.leave(liveSessionPhElement.contents());
                    }
                }
            }

            function _activateLiveSession(userLiveSessionState) {
                _endLiveSession();

                let defer = $q.defer();

                readyProm.then(function(){
                    childScope = $rootScope.$new(true);
                    childScope.d = {
                        userLiveSessionState: userLiveSessionState,
                        onClose: function(){
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
            }

            function activateLiveSession(userLiveSession) {
                return _activateLiveSession(userLiveSession);
            }

            function endLiveSession() {
                _endLiveSession();
            }

            function showStudentConfirmationPopUp(){
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.LIVE_SESSION_REQUEST');
                translationsPromMap.content= $translate('LIVE_SESSION.WANT_TO_JOIN');
                translationsPromMap.acceptBtnTitle = $translate('LIVE_SESSION.JOIN');
                translationsPromMap.cancelBtnTitle = $translate('LIVE_SESSION.DECLINE');
                return $q.all(translationsPromMap).then(function(translations){
                    let popUpInstance = PopUpSrv.warning(
                        translations.title,
                        translations.content,
                        translations.cancelBtnTitle,
                        translations.acceptBtnTitle
                    );
                    return popUpInstance.promise.then(function(res){
                        return $q.reject(res);
                    },function(res){
                        return $q.resolve(res);
                    });
                },function(err){
                    $log.error('LiveSessionUiSrv: showStudentConfirmationPopUp translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showEducatorPendingPopUp(){
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.LIVE_SESSION_REQUEST');
                translationsPromMap.content= $translate('LIVE_SESSION.WAIT_TO_STUDENT');
                translationsPromMap.cancelBtnTitle = $translate('LIVE_SESSION.CANCEL');
                return $q.all(translationsPromMap).then(function(translations){
                    PopUpSrv.wait(translations.title, translations.content, translations.cancelBtnTitle);
                },function(err){
                    $log.error('LiveSessionUiSrv: showEducatorPendingPopUp translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showWaitPopUp(){
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.STARTING_SESSION');
                return $q.all(translationsPromMap).then(function(translations){
                    PopUpSrv.wait(translations.title);
                },function(err){
                    $log.error('LiveSessionUiSrv: showWaitPopUp translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showSessionEndAlertPopup() {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.END_ALERT', { endAlertTime: SESSION_DURATION.endAlertTime / 60000 });
                translationsPromMap.content= $translate('LIVE_SESSION.EXTEND_SESSION', { extendTime: SESSION_DURATION.extendTime / 60000 });
                translationsPromMap.extendBtnTitle = $translate('LIVE_SESSION.EXTEND');
                translationsPromMap.cancelBtnTitle = $translate('LIVE_SESSION.CANCEL');
                return $q.all(translationsPromMap).then(function(translations){
                    let popUpInstance = PopUpSrv.warning(
                        translations.title,
                        translations.content,
                        translations.cancelBtnTitle,
                        translations.extendBtnTitle
                    );
                    return popUpInstance.promise.then(function(res){
                        return $q.reject(res);
                    },function(res){
                        return $q.resolve(res);
                    });
                },function(err){
                    $log.error('LiveSessionUiSrv: showSessionEndAlertPopup translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showEndSessionPopup() {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.END_POPUP_TITLE');
                translationsPromMap.content= $translate('LIVE_SESSION.END_POPUP_CONTENT');
                return $q.all(translationsPromMap).then(function(translations){
                    let popUpInstance = PopUpSrv.info(
                        translations.title,
                        translations.content
                    );
                    return popUpInstance.promise.then(function(res){
                        return $q.reject(res);
                    },function(res){
                        return $q.resolve(res);
                    });
                },function(err){
                    $log.error('LiveSessionUiSrv: showEndSessionPopup translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showIncompleteDiagnostic(studentName) {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.CANT_START_SESSION');
                translationsPromMap.content= $translate('LIVE_SESSION.INCOMPLETE_DIAGNOSTIC_CONTENT', { studentName: studentName });
                return $q.all(translationsPromMap).then(function(translations){
                    PopUpSrv.info(translations.title, translations.content);
                },function(err){
                    $log.error('LiveSessionUiSrv: showIncompleteDiagnostic translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showNoLessonScheduledPopup(studentName) {
                let translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.CANT_START_SESSION');
                translationsPromMap.content= $translate('LIVE_SESSION.NO_LESSON_SCHEDULED', { studentName: studentName });
                return $q.all(translationsPromMap).then(function(translations){
                    PopUpSrv.info(translations.title, translations.content);
                },function(err){
                    $log.error('LiveSessionUiSrv: showNoLessonScheduledPopup translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showLiveSessionToast() {
                let options = {
                    hideDelay: 5000,
                    position: 'top right',
                    toastClass: 'live-session-success-toast'
                };
                let translationsProm = $translate('LIVE_SESSION.JOIN_TO_ACTIVE_SESSION');
                translationsProm.then(function (message) {
                    ZnkToastSrv.showToast('success', message, options);
                });
            }

            function closePopup() {
                if(PopUpSrv.isPopupOpen()){
                    PopUpSrv.closePopup();
                }
            }

            function isDarkFeaturesValid(educatorId, studentId) {
                if (darkFeaturesValid !== null) {
                    return Promise.resolve(darkFeaturesValid);
                } else {
                    return UserProfileService.darkFeaturesValid([educatorId, studentId])
                        .then(isValid => {
                            darkFeaturesValid = isValid;
                            return darkFeaturesValid;
                        });
                }
            }


            LiveSessionUiSrv.activateLiveSession = activateLiveSession;
            LiveSessionUiSrv.endLiveSession = endLiveSession;
            LiveSessionUiSrv.showStudentConfirmationPopUp = showStudentConfirmationPopUp;
            LiveSessionUiSrv.showEducatorPendingPopUp = showEducatorPendingPopUp;
            LiveSessionUiSrv.showWaitPopUp = showWaitPopUp;
            LiveSessionUiSrv.showSessionEndAlertPopup = showSessionEndAlertPopup;
            LiveSessionUiSrv.showEndSessionPopup = showEndSessionPopup;
            LiveSessionUiSrv.showLiveSessionToast = showLiveSessionToast;
            LiveSessionUiSrv.showIncompleteDiagnostic = showIncompleteDiagnostic;
            LiveSessionUiSrv.showNoLessonScheduledPopup = showNoLessonScheduledPopup;
            LiveSessionUiSrv.closePopup = closePopup;
            LiveSessionUiSrv.isDarkFeaturesValid = isDarkFeaturesValid;

            //was wrapped with timeout since angular will compile the dom after this service initialization
            readyProm = $timeout(function(){
                _init();
            });

            return LiveSessionUiSrv;
        };
    });
})(angular);
