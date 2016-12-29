(function (angular) {

    angular.module('demo', ['znk.infra-web-app.adminDashboard'])
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
        .constant('ENV', {
            firebaseAppScopeName: "act_dashboard",
            fbGlobalEndPoint: "https://znk-dev.firebaseio.com/",
            fbDataEndPoint: "https://act-dev.firebaseio.com/",
            appContext: 'student',
            studentAppName: 'sat_app',
            dashboardAppName: 'sat_dashboard',
            videosEndPoint: "//dfz02hjbsqn5e.cloudfront.net/sat_app/",
            mediaEndPoint: "//dfz02hjbsqn5e.cloudfront.net/",
            backendEndpoint: "https://znk-web-backend-dev.azurewebsites.net/",
            teachworksDataUrl: 'teachworks',
            debug: true,
            "elasticSearch": {
                "host": "znk-elastic-dev4891.cloudapp.net:9200",
                "apiVersion": "5.x",
                "log": "trace"
            }
        })
        .controller('Main', function ($state) {
            var self = this;

            if (!$state.current.name) {
                $state.go('eslink');
            }
        })

})(angular);
