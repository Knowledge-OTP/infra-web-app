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
            $delegate.elasticSearchIndex = "firebase_dev",
            $delegate.elasticSearch = {
                    "host": "https://search-zinkerz-6dswvvkm2zqqypw2aui6yhpfpa.us-east-1.es.amazonaws.com",
                    "apiVersion": "5.x",
                    "log": "trace"
                }

            return $delegate;
        })
        .decorator('StudentContextSrv', function ($delegate) {
            'ngInject';

            $delegate.getCurrUid = function () {
                return 'a844bf16-97f2-449a-a996-bbf229640a01';
            };
            return $delegate;
        })
        .decorator('AuthService', function ($delegate) {
            'ngInject';

            $delegate.getAuth = function () {
                return {uid: 'a844bf16-97f2-449a-a996-bbf229640a01'};
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
