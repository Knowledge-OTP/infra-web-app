angular.module('demo', ['znk.infra-web-app.znkHeader'])
    .constant('ENV', {
        fbGlobalEndPoint: "https://znk-dev.firebaseio.com/",
        backendEndpoint: "https://znk-web-backend-dev.azurewebsites.net/",
        fbDataEndPoint: "https://act-dev.firebaseio.com/",
        dataAuthSecret: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM",
        redirectLogin: "http://dev-act.zinkerz.com.s3-website-eu-west-1.amazonaws.com/",
        firebaseAppScopeName: "act_app",
        redirectLogout: "http://localhost:9002",
        appContext: 'student',
        studentAppName: 'sat_app',
        dashboardAppName: 'sat_dashboard',
        videosEndPoint: "//dfz02hjbsqn5e.cloudfront.net/sat_app/",
        mediaEndPoint: "//dfz02hjbsqn5e.cloudfront.net/",
        purchasePaypalParams: {
            "formAction": "https://www.sandbox.paypal.com/cgi-bin/webscr",
            "hostedButtonId": "J2J2GMDNZCMBU",
            "btnImgSrc": "https://www.sandbox.paypal.com/en_US/i/btn/btn_buynow_LG.gif",
            "pixelGifSrc": "https://www.sandbox.paypal.com/en_US/i/scr/pixel.gif"
        }
    })
    .config(function ($translateProvider, znkHeaderSrvProvider, $stateProvider) {
        'ngInject';
        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy(null);
        $stateProvider
            .state('item1', {
                url: '/item1',
                template: '<div>item1</div>'
            })
            .state('item2', {
                url: '/item2',
                template: '<div>item2</div>'
            });

        var demoItem1 = {
            text: 'item 1',
            goToState: 'item1',
            stateOpt: { reload: true }
        };

        var demoItem2 = {
            text: 'item 2',
            goToState: 'item2'
        };
        var additionalItems = [demoItem1, demoItem2];

        znkHeaderSrvProvider.addAdditionalNavMenuItems(additionalItems);
    });

