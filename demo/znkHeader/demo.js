angular.module('demo', ['znk.infra-web-app.znkHeader'])
    .config(function ($translateProvider, znkHeaderSrvProvider) {

        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en');

        var demoItem1 = {
            text: 'item 1',
            onClickHandler: function (purchaseService) {
                if(angular.isUndefined(purchaseService)){
                    alert('DI error');
                }
                alert('item 1 was clicked')
            }
        };

        var demoItem2 = {
            text: 'item 2',
            onClickHandler: function () {
                alert('item 2 was clicked')
            }
        };
        var additionalItems = [demoItem1, demoItem2];

        znkHeaderSrvProvider.addAdditionalNavMenuItems(additionalItems);
    })
    .service('ENV', function () {
        this.fbGlobalEndPoint = "https://znk-dev.firebaseio.com/";
        this.backendEndpoint = "https://znk-web-backend-dev.azurewebsites.net/";
        this.fbDataEndPoint = "https://act-dev.firebaseio.com/";
        this.dataAuthSecret = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicmFjY29vbnMifQ.mqdcwRt0W5v5QqfzVUBfUcQarD0IojEFNisP-SNIFLM";
        this.redirectLogin = "http://dev-act.zinkerz.com.s3-website-eu-west-1.amazonaws.com/";
        this.firebaseAppScopeName = "act_app";
        this.redirectLogout = "http://localhost:9002";
    })
    .run(function ($rootScope, $translate, $translatePartialLoader) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
        $translatePartialLoader.addPart('demo');
    });

