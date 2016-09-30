(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').constant('PROMO_CODE_STATUS', {
        accepted: 0,
        invalid: 1
    });

    angular.module('znk.infra-web-app.loginApp').constant('PROMO_CODE_TYPE', {
        FREE_LICENCE: 'free licence',
        ZINKERZ_EDUCATOR: 'Zinkerz educator'
    });

})(angular);

