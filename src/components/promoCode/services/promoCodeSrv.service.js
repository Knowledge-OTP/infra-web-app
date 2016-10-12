(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').provider('PromoCodeSrv',
        function () {
            var backendData = {};

            this.setBackendData = function (_backendData) {
                backendData = _backendData;
            };

            this.$get = function (PROMO_CODE_STATUS, $translate, $http, PromoCodeTypeEnum) {
                'ngInject';

                var promoCodeStatus;
                var INVALID = 'PROMO_CODE.INVALID_CODE';
                var promoCodeCheckBaseUrl = '%backendEndpoint%/promoCode/check';
                var promoCodeToUpdate;

                var promoCodeStatusText = {};
                promoCodeStatusText[PromoCodeTypeEnum.FREE_LICENSE.enum] = 'PROMO_CODE.PROMO_CODE_ACCEPTED';
                promoCodeStatusText[PromoCodeTypeEnum.ZINKERZ_EDUCATOR.enum] = 'PROMO_CODE.ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED';
                promoCodeStatusText[INVALID] = INVALID;

                this.checkPromoCode = function (promoCode, appContext) {
                    var firebaseAppScopeName =  backendData[appContext].firebaseAppScopeName;
                    var promoCodeCheckUrl = promoCodeCheckBaseUrl;
                    var backendEndpointUrl = backendData[appContext].backendEndpoint;
                    promoCodeCheckUrl = promoCodeCheckUrl.replace('%backendEndpoint%', backendEndpointUrl);

                    var dataToSend = {
                        promoCode: promoCode,
                        appName: firebaseAppScopeName
                    };
                    return $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
                };

                this.promoCodeToUpdate = function (promoCode) {
                    promoCodeToUpdate = promoCode;
                };

                this.getPromoCodeToUpdate = function () {
                    return promoCodeToUpdate;
                };

                this.updatePromoCode = function (uid, promoCode, appContext) {
                    var firebaseAppScopeName =  backendData[appContext].firebaseAppScopeName;
                    var dataToSend = {
                        appName: firebaseAppScopeName,
                        uid: uid,
                        promoCode: promoCode
                    };
                    return $http.post(promoCodeToUpdateUrl, dataToSend);
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
        }
    );
})(angular);
