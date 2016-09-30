(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').constant('PROMO_CODE_STATUS', {
        accepted: 0,
        alreadyRedeemed: 1,
        invalid: 2
    });

    angular.module('znk.infra-web-app.loginApp').constant('PROMO_CODE_TYPE', {
        freeLicence: 0,
        ZinkerzEducator: 1
    });

})(angular);

