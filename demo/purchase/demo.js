(function (angular) {
    'use strict';

    angular.module('demo', ['znk.infra-web-app.purchase'])
        .constant('ENV', {
            firebaseAppScopeName: "sat_app",
            fbDataEndPoint: "https://sat-dev.firebaseio.com/",
            appContext: 'student',
            studentAppName: 'sat_app',
            dashboardAppName: 'sat_dashboard',
            videosEndPoint: "//dfz02hjbsqn5e.cloudfront.net/sat_app/",
            mediaEndPoint: "//dfz02hjbsqn5e.cloudfront.net/",
            fbGlobalEndPoint: 'https://znk-dev.firebaseio.com/',
            purchasePaypalParams: {
                "formAction": "https://www.sandbox.paypal.com/cgi-bin/webscr",
                "hostedButtonId": "J2J2GMDNZCMBU",
                "btnImgSrc": "https://www.sandbox.paypal.com/en_US/i/btn/btn_buynow_LG.gif",
                "pixelGifSrc": "https://www.sandbox.paypal.com/en_US/i/scr/pixel.gif"
            }
        })
        .config(function ($translateProvider) {
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/{part}/locale/{lang}.json'
            })
                .preferredLanguage('en')
        })
        .run(function ($rootScope, $translate) {
            $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
                $translate.refresh();
            })
        })
        .controller('Main', function (purchaseService) {
            'ngInject';
            var vm = this;
            vm.showPurchaseDialog = purchaseService.showPurchaseDialog;
        });
})(angular);

