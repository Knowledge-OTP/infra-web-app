(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('PromoCodeSrv',
        function (PROMO_CODE_STATUS, PROMO_CODE_TYPE, $translate, $q, $http, ENV) {
            'ngInject';

            var defferd;
            var promoCodeStatus;
            var INVALID = 'PROMO_CODE.INVALID_CODE';
            var promoCodeCheckUrl = 'http://localhost:8000/promoCode/check'; // todo - get correct url
            var promoCodeToUpdateUrl= 'http://localhost:8000/promoCode/update'; // todo - get correct url
            var promoCodeToUpdate;

            var promoCodeStatusText = {};
            promoCodeStatusText[PROMO_CODE_TYPE.ZINKERZ_EDUCATOR] = 'PROMO_CODE.ZINKERZ_EDUCATORS_CODE_ACCEPTED';
            promoCodeStatusText[PROMO_CODE_TYPE.FREE_LICENCE] = ' ';  //todo- what text to display
            promoCodeStatusText[INVALID] = INVALID;


            this.checkPromoCode = function (promoCode) {
                defferd = $q.defer();
                var dataToSend = {};
                dataToSend.promoCode = promoCode;
                dataToSend.appName =  ENV.firebaseAppScopeName;

                $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
                return defferd.promise;
            };

            this.promoCodeToUpdate = function (promoCode) {
                promoCodeToUpdate = promoCode;
            };

            this.updatePromoCode = function (uid) {
                var dataToSend = {};
                dataToSend.appName =  ENV.firebaseAppScopeName;
                dataToSend.uid = uid;
                dataToSend.promoCode = promoCodeToUpdate;

                if (promoCodeToUpdate) {
                     return $http.post(promoCodeToUpdateUrl, dataToSend)
                }
                return $q.when({});
            };

            function _validPromoCode(response) {
                promoCodeStatus = {};
                if (response.data && promoCodeStatusText[response.data]) {
                    promoCodeStatus.text = _getPromoCodeStatusText(response.data);
                    promoCodeStatus.status = PROMO_CODE_STATUS.accepted
                } else {
                    promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                    promoCodeStatus.status = PROMO_CODE_STATUS.invalid
                }
                defferd.resolve(promoCodeStatus);
            }

            function _invalidPromoCode() {
                promoCodeStatus = {};
                promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                defferd.resolve(promoCodeStatus);
            }

            function _getPromoCodeStatusText(translationKey) {
                return $translate.instant(promoCodeStatusText[translationKey]);
            }
        }
    );
})(angular);
