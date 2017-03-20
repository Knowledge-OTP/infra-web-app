(function(window, angular){
    'use strict';

    angular.module('znk.infra-web-app.loginApp')
        .run(function ($location, InvitationKeyService) {
        var search = $location.search();
        var iid = search.iid;
        if (angular.isDefined(iid) && iid !== null) {
            InvitationKeyService.saveInvitationKey(iid);
        }
    });
})(window, angular);
