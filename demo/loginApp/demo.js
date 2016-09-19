angular.module('demo', ['znk.infra-web-app.loginApp'])
    .config(function ($translateProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
            .preferredLanguage('en');
    })
    .run(function ($rootScope, $translate, InvitationKeyService, AuthService, $location) {
        var search = $location.search();
        var iid = search['iid'];
        if (angular.isDefined(iid) && iid != null) {
            $location.search('iid', null);
            InvitationKeyService.saveInvitationKey(iid);
            var auth = AuthService.getAuth();

        }

        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        })
    });
