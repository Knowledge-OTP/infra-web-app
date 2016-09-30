(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('PromoCodeSrv',
        function (PROMO_CODE_STATUS, PROMO_CODE_TYPE, $translate, $q) {
            'ngInject';

            var promoCodeStatusText = {};
            promoCodeStatusText[PROMO_CODE_STATUS.accepted + '_' + PROMO_CODE_TYPE.ZinkerzEducator] = 'PROMO_CODE.ZINKERZ_EDUCATORS_CODE_ACCEPTED';
            promoCodeStatusText[PROMO_CODE_STATUS.invalid + '_' + PROMO_CODE_TYPE.ZinkerzEducator] = 'PROMO_CODE.INVALID_CODE';
            promoCodeStatusText[PROMO_CODE_STATUS.invalid + '_' + PROMO_CODE_TYPE.freeLicence] = 'PROMO_CODE.INVALID_CODE';

            this.checkPromoCode = function (promoCode) {
                var resObject = {
                    promoCodeType:1, //zinkerz educator
                    promoCodeStatus: 0 //accepted
                };

                return $q.when(resObject);
            };

            this.getPromoCodeStatusText = function (promoCodeStatus, promoCodeType){
                if(promoCodeStatusText[promoCodeStatus + '_' + promoCodeType]){
                    return $translate.instant(promoCodeStatusText[promoCodeStatus + '_' + promoCodeType]);
                } else {
                    // todo - design meeting
                }
            }
        }
    );
})(angular);
