(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionUiSrv',function(){

        this.$get = function ($rootScope, $timeout, $compile, $animate, PopUpSrv, $translate, $q, $log, ENV, ZnkToastSrv) {
            'ngInject';

            var childScope, liveSessionPhElement, readyProm;
            var LiveSessionUiSrv = {};

            function _init() {
                var bodyElement = angular.element(document.body);

                liveSessionPhElement = angular.element('<div class="live-session-ph"></div>');

                bodyElement.append(liveSessionPhElement);
            }

            function _endLiveSession() {
                if(childScope){
                    childScope.$destroy();
                }

                if(liveSessionPhElement){
                    var hasContents = !!liveSessionPhElement.contents().length;
                    if(hasContents){
                        $animate.leave(liveSessionPhElement.contents());
                    }
                }
            }

            function _activateLiveSession(userLiveSessionState) {
                _endLiveSession();

                var defer = $q.defer();

                readyProm.then(function(){
                    childScope = $rootScope.$new(true);
                    childScope.d = {
                        userLiveSessionState: userLiveSessionState,
                        onClose: function(){
                            defer.resolve('closed');
                        }
                    };

                    var liveSessionHtmlTemplate =
                        '<div class="show-hide-animation">' +
                        '<live-session user-live-session-state="d.userLiveSessionState" ' +
                        'on-close="d.onClose()">' +
                        '</live-session>' +
                        '</div>';
                    var liveSessionElement = angular.element(liveSessionHtmlTemplate);
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

            function showStudentLiveSessionPopUp(){
                var translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.LIVE_SESSION_REQUEST');
                translationsPromMap.content= $translate('LIVE_SESSION.WANT_TO_JOIN');
                translationsPromMap.acceptBtnTitle = $translate('LIVE_SESSION.REJECT');
                translationsPromMap.cancelBtnTitle = $translate('LIVE_SESSION.ACCEPT');
                return $q.all(translationsPromMap).then(function(translations){
                    var popUpInstance = PopUpSrv.warning(
                        translations.title,
                        translations.content,
                        translations.acceptBtnTitle,
                        translations.cancelBtnTitle
                    );
                    return popUpInstance.promise.then(function(res){
                        return $q.reject(res);
                    },function(res){
                        return $q.resolve(res);
                    });
                },function(err){
                    $log.error('LiveSessionUiSrv: translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showSessionEndAlertPopup() {
                var translationsPromMap = {};
                translationsPromMap.title = $translate('LIVE_SESSION.END_ALERT', { endAlertTime: ENV.liveSession.sessionEndAlertTime });
                translationsPromMap.content= $translate('LIVE_SESSION.EXTEND_SESSION', { extendTime: ENV.liveSession.sessionExtendTime });
                translationsPromMap.acceptBtnTitle = $translate('LIVE_SESSION.REJECT');
                translationsPromMap.cancelBtnTitle = $translate('LIVE_SESSION.ACCEPT');
                return $q.all(translationsPromMap).then(function(translations){
                    var popUpInstance = PopUpSrv.warning(
                        translations.title,
                        translations.content,
                        translations.acceptBtnTitle,
                        translations.cancelBtnTitle
                    );
                    return popUpInstance.promise.then(function(res){
                        return $q.reject(res);
                    },function(res){
                        return $q.resolve(res);
                    });
                },function(err){
                    $log.error('LiveSessionUiSrv: translate failure' + err);
                    return $q.reject(err);
                });
            }

            function showLiveSessionToast() {
                var options = {
                    hideDelay: false,
                    position: 'top left'
                };
                var translationsProm = $translate('LIVE_SESSION.JOIN_TO_ACTIVE_SESSION');
                translationsProm.then(function (message) {
                    ZnkToastSrv.showToast('success', message, options);
                });
            }


            LiveSessionUiSrv.activateLiveSession = activateLiveSession;

            LiveSessionUiSrv.endLiveSession = endLiveSession;

            LiveSessionUiSrv.showStudentLiveSessionPopUp = showStudentLiveSessionPopUp;

            LiveSessionUiSrv.showSessionEndAlertPopup = showSessionEndAlertPopup;

            LiveSessionUiSrv.showLiveSessionToast = showLiveSessionToast;


            //was wrapped with timeout since angular will compile the dom after this service initialization
            readyProm = $timeout(function(){
                _init();
            });

            return LiveSessionUiSrv;
        };
    });
})(angular);
