(function(angular) {
    'use strict';
    angular.module('demo', [
        'demoEnv',
        'znk.infra.userContext',
        'znk.infra-web-app.invitation',
        'znk.infra.config',
        'znk.infra.user',
        'ngMaterial',
        'znk.infra.auth',
        'pascalprecht.translate',
        'znk.infra-web-app.liveLessons'
    ])
        .config(function () {
            // Replace storageConfig parameters through localStorage
            localStorage.setItem('email', 'alex+100@zinkerz.com');
            localStorage.setItem('password', '9917364');
            localStorage.setItem('dataDbPath', 'https://act-dev.firebaseio.com/');
            localStorage.setItem('studentPath', '/act_app');
            localStorage.setItem('teacherPath', '/act_dashboard');
        })
        .config(function (PresenceServiceProvider, znkAnalyticsSrvProvider) {

            PresenceServiceProvider.setAuthServiceName('AuthService');
            znkAnalyticsSrvProvider.setEventsHandler(function () {
                return {
                    eventTrack: angular.noop,
                    timeTrack: angular.noop,
                    pageTrack: angular.noop,
                    setUsername: angular.noop,
                    setUserProperties: angular.noop
                };
            });
        })
        .decorator('ENV', function ($delegate) {
            'ngInject';

            $delegate.firebaseAppScopeName = 'act_dashboard';
            $delegate.fbDataEndPoint = '//act-dev.firebaseio.com/';
            $delegate.appContext = 'dashboard';
            $delegate.studentAppName = 'act_app';
            $delegate.dashboardAppName = 'act_dashboard';
            $delegate.videosEndPoint = '//dfz02hjbsqn5e.cloudfront.net/act_app/';
            $delegate.mediaEndPoint = '//dfz02hjbsqn5e.cloudfront.net/';
            $delegate.fbGlobalEndPoint = '//znk-dev.firebaseio.com/';
            $delegate.backendEndpoint = '//znk-web-backend-dev.azurewebsites.net/';
            $delegate.teachworksDataUrl = 'teachworks';
            $delegate.userIdleTime = 30;
            $delegate.idleTimeout = 0;
            $delegate.idleKeepalive = 2;
            $delegate.plivoUsername = "ZinkerzDev160731091034";
            $delegate.plivoPassword = "zinkerz$9999";

            $delegate.liveSession = {
                sessionLength: 45,    // in minutes
                sessionExtendTime: 15, // in minutes
                sessionEndAlertTime: 5 // in minutes
            };

            return $delegate;
        })
        .decorator('StudentContextSrv', function ($delegate) {
            'ngInject';

            $delegate.getCurrUid = function () {
                return 'e6a83840-01cc-4e15-af9b-26d9dbbd87d7';
            };
            return $delegate;
        })
        .decorator('AuthService', function ($delegate) {
            'ngInject';

            $delegate.getAuth = function () {
                return { uid: 'cf656635-b44c-4fcc-82ef-72fe566d5540' };
            };
            return $delegate;
        })
        .controller('Main', function (MyLiveLessons) {
            'ngInject';
            var vm = this;
            vm.openMyLessonsPopup = function () {
                MyLiveLessons.liveLessonsScheduleModal();
            };
        });
})(angular);
