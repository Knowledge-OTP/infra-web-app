(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "PROMO_CODE": {
                            "GOT_A_PROMO_CODE": "Got a Promo Code?",
                            "GOT_A_ZINKERZ_EDUCATORS_PROMO_CODE": "Got a Zinkerz Educator Code",
                            "ENTER_YOUR_CODE": "Enter your code...",
                            "ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED": "Zinkerz Educators Code Accepted",
                            "PROMO_CODE_ACCEPTED": "Promo code accepted",
                            "INVALID_CODE": "Invalid code, please contact support@zinkerz.com"
                        }
                    }
                );
            });
})(angular);
