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
        })
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'close-popup': 'assets/svg/close-popup.svg',
                    'feedback-icon': 'assets/svg/feedback-icon.svg',
                    'completed-v-feedback-icon': 'assets/svg/completed-v-feedback.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);
