(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.auth',
        'demoEnv',
        'znk.infra.svgIcon',
        'ngMaterial',
        'znk.infra.user',
        'satellizer',
        'znk.infra.general'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                'form-lock': 'components/loginApp/svg/form-lock.svg',
                'facebook-icon': 'components/loginApp/svg/facebook-icon.svg',
                'google-icon': 'components/loginApp/svg/google-icon.svg',
                'login-username-icon': 'components/loginApp/svg/login-username-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ])
        .run(function (InvitationKeyService, AuthService, $location, InvitationStorageSrv, $log) {
            var search = $location.search();
            var iid = search['iid'];
            if (angular.isDefined(iid) && iid != null) {
                $location.search('iid', null);
                InvitationKeyService.saveInvitationKey(iid);
                var authObj = AuthService.getAuth();
                console.log(authObj);
                if (authObj) {
                    InvitationStorageSrv.getInvitationObject(iid).then(function (res) {
                        var invitation = res;
                        console.log(invitation);
                        if (angular.equals(invitation, {})) {
                            $log.error('Invitation object is empty');
                            return;
                        }
                        var receiverEmail = invitation.receiverEmail;
                        if (receiverEmail === authObj.auth.token.email.toLowerCase()) {
                            redirectToApp();
                        } else {
                            logout();
                        }
                    })
                }
            }
            function redirectToApp() {
                InvitationKeyService.navigateWithInvitationKey();
            }

            function logout() {
                AuthService.logout();
            }
        })

})(window, angular);
