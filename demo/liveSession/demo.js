(function(angular) {
    'use strict';
    angular.module('demo', [
        'demoEnv',
        'znk.infra.auth',
        'pascalprecht.translate',
        'znk.infra-web-app.liveSession'
        ])
        .config(function () {
            // Replace storageConfig parameters through localStorage
            localStorage.setItem('email', 'ofir+actEdu@zinkerz.com');
            localStorage.setItem('password', '123123');
            localStorage.setItem('dataDbPath', 'https://act-dev.firebaseio.com/');
            localStorage.setItem('studentPath', '/act_app');
            localStorage.setItem('teacherPath', '/act_dashboard');
        })
        .config(function (PresenceServiceProvider, znkAnalyticsSrvProvider, CallsUiSrvProvider) {

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

            var calleeNameFunc = function ($q) {
                'ngInject';
                return function () {
                    return $q.when('Ofir Student');

                }
            };

            CallsUiSrvProvider.setCalleeNameFnGetter(calleeNameFunc);
        })
        .decorator('ENV', function ($delegate) {
            'ngInject';

            $delegate.firebaseAppScopeName = 'act_dashboard';
            $delegate.fbDataEndPoint = '//act-dev.firebaseio.com/';
            $delegate.appContext = 'dashboard';
            $delegate.studentAppName = 'act_app';
            $delegate.dashboardAppName = 'act_dashboard';
            $delegate.videosEndPoint = '//dfz02hjbsqn5e.cloudfront.net/act_app/';
            $delegate.mediaEndpoint = '//dfz02hjbsqn5e.cloudfront.net/';
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
                return new Promise(resolve => resolve({ uid: 'cf656635-b44c-4fcc-82ef-72fe566d5540' }));
            };
            return $delegate;
        })
        .controller('Main', function ($timeout, TeacherContextSrv, StudentContextSrv) {
            'ngInject';
            var vm = this;

            vm.student = {addedTime:1482404147410,
                invitationId:"caab7c9b-6c3d-410d-3e29-f13c1d10b653",
                invitationReceiverEmail:"ofir+actStu11@zinkerz.com",
                invitationReceiverName:"ofir+actStu11",
                name:"ofir+actStu11",
                originalReceiverEmail:"ofir+actStu11@zinkerz.com",
                originalReceiverName:"ofir+actStu11",
                receiverEmail:"ofir+actStu11@zinkerz.com",
                receiverUid:"e6a83840-01cc-4e15-af9b-26d9dbbd87d7",
                uid:"e6a83840-01cc-4e15-af9b-26d9dbbd87d7",
                presence:1
            };

            $timeout(function () {
                StudentContextSrv.setCurrentUid('e6a83840-01cc-4e15-af9b-26d9dbbd87d7');
                TeacherContextSrv.setCurrentUid('cf656635-b44c-4fcc-82ef-72fe566d5540');
            }, 2000);
        });
})(angular);
