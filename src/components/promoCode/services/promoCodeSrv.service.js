(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').service('PromoCodeSrv',
        function (PROMO_CODE_STATUS, $translate, $http, ENV, PromoCodeTypeEnum) {
            'ngInject';

            var promoCodeStatus;
            var INVALID = 'PROMO_CODE.INVALID_CODE';
            // var promoCodeCheckUrl = ENV.backendEndpoint + '/promoCode/check';
            var promoCodeCheckUrl = 'http://localhost:8000/promoCode/check'; // todo - get correct url
            var promoCodeToUpdate;

            var promoCodeStatusText = {};
            promoCodeStatusText[PromoCodeTypeEnum.FREE_LICENSE.enum] = 'PROMO_CODE.PROMO_CODE_ACCEPTED';
            promoCodeStatusText[PromoCodeTypeEnum.ZINKERZ_EDUCATOR.enum] = 'PROMO_CODE.ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED';
            promoCodeStatusText[INVALID] = INVALID;

            this.checkPromoCode = function (promoCode) {
                var dataToSend = {
                    promoCode: promoCode,
                    appName: ENV.firebaseAppScopeName

                };

                return $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
            };

            this.promoCodeToUpdate = function (promoCode) {
                promoCodeToUpdate = promoCode;
            };

            this.getPromoCodeToUpdate = function () {
                return promoCodeToUpdate;
            };

            function _validPromoCode(response) {
                promoCodeStatus = {};
                var promoCodeType = response.data;
                if (response.data && promoCodeStatusText[promoCodeType]) {
                    promoCodeStatus.text = _getPromoCodeStatusText(response.data);
                    promoCodeStatus.status = PROMO_CODE_STATUS.accepted;
                } else {
                    promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                    promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                }
                return promoCodeStatus;
            }

            function _invalidPromoCode() {
                promoCodeStatus = {};
                promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                return promoCodeStatus;
            }

            function _getPromoCodeStatusText(translationKey) {
                return $translate.instant(promoCodeStatusText[translationKey]);
            }
        }
    );
})(angular);
