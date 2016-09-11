(function(angular) {
    'use strict';
    angular.module('demo', ['znk.infra-web-app.feedback'])
        .constant('ENV', {
            firebaseAppScopeName: "demo_app",
            fbDataEndPoint: "https://sat-dev.firebaseio.com/",
            appContext: 'student',
            studentAppName: 'demo_app',
            dashboardAppName: 'demo_dashboard',
            videosEndPoint: "//dfz02hjbsqn5e.cloudfront.net/sat_app/",
            mediaEndPoint: "//dfz02hjbsqn5e.cloudfront.net/",
            fbGlobalEndPoint: 'https://znk-dev.firebaseio.com/',
            doorBellSubmitURL: 'https://doorbell.io/api/applications/3084/submit?key=44D4VA8hGpMjLAXnqLFDdtIRxqRFZkesEp8jwZ5WgCm9W5UCZ9kmZeVtHHp0KF8D'
        });
})(angular);
