(function (angular) {

    angular.module('demo', [
        'znk.infra-web-app.adminDashboard',
        'demoEnv',
        'znk.infra.userContext',
        'znk.infra.config',
        'znk.infra.user',
        'ngMaterial',
        'znk.infra.auth',
        'znk.infra.presence',
        'znk.infra.analytics',
        'pascalprecht.translate',
        'znk.infra-web-app.lazyLoadResource'
    ])
        .config([
            '$stateProvider',
            function ($stateProvider) {
                $stateProvider
                    .state('eslink', {
                        url: '/eslink',
                        templateUrl: '/templates/esLink.template.html',
                        controllerAs: 'vm'
                    })
                    .state('emetadata', {
                        url: '/emetadata',
                        templateUrl: '/templates/eMetadata.template.html',
                        controllerAs: 'vm'
                    });
            }

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
            $delegate.elasticSearch = {
                "host": "znk-elastic-dev4891.cloudapp.net:9200",
                "apiVersion": "5.x",
                "log": "trace"
            }

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
                return {uid: 'cf656635-b44c-4fcc-82ef-72fe566d5540'};
            };
            return $delegate;
        })
        .controller('Main', function ($state) {
            var self = this;

            if (!$state.current.name) {
                $state.go('eslink');
            }
        })

})(angular);
