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

        znkHeaderSrvProvider.addAdditionalItems(additionalItems);
    })
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        })
    });

