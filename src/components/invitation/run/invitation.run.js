(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation')
        .run(function($location, InvitationService){
            'ngInject';
            var search = $location.search();

            if (angular.isDefined(search.iid)) {
                InvitationService.showInvitationConfirm(search.iid);
                delete search.iid;
                $location.search(search);
            }
        });

})(angular);
