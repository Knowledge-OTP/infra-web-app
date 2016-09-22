(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('InvitationKeyService',
        function () {
            'ngInject';
            var invitationKey;

            this.saveInvitationKey = function (_invitationKey) {
                invitationKey = _invitationKey;
            };

            this.getInvitationKey = function () {
                return invitationKey;
            };

          //   this.navigateWithInvitationKey = function () {
          //       // var appUrl = ENV.redirectSignup;
          //       var inviteId = this.getInvitationKey();
          //       if (angular.isDefined(inviteId)) {
          //           appUrl += '#?iid=' + inviteId;
          //       }
          //       $window.location.replace(appUrl);
          // };
        }
    );
})(angular);
