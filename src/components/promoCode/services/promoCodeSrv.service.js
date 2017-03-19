(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').provider('PromoCodeSrv',
        function (ENV) {

            var backendData = {};
            var appContext = ENV.firebaseAppScopeName;

            backendData[appContext] = {  //default data
                backendEndpoint: ENV.backendEndpoint,
                currentAppName: ENV.firebaseAppScopeName,
                studentAppName: ENV.studentAppName,
                dashboardAppName:  ENV.dashboardAppName
            };

            this.setBackendData = function (_backendData) {
                backendData = _backendData;
            };

            this.$get = function (PROMO_CODE_STATUS, $translate, $http, PromoCodeTypeEnum) {
                'ngInject';

                var promoCodeSrv = {};

                var promoCodeStatus;
                var INVALID = 'PROMO_CODE.INVALID_CODE';
                var promoCodeCheckBaseUrl = '%backendEndpoint%/promoCode/check';
                var promoCodeUpdateBaseUrl = '%backendEndpoint%/promoCode/update';
                var promoCodeToUpdate;

                var promoCodeStatusText = {};
                promoCodeStatusText[PromoCodeTypeEnum.FREE_LICENSE.enum] = 'PROMO_CODE.PROMO_CODE_ACCEPTED';
                promoCodeStatusText[PromoCodeTypeEnum.ZINKERZ_EDUCATOR.enum] = 'PROMO_CODE.ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED';
                promoCodeStatusText[INVALID] = INVALID;

                promoCodeSrv.checkPromoCode = function (promoCode, appContext) {
                    var backendEndpointUrl = backendData[appContext].backendEndpoint;

                    var promoCodeCheckUrl = promoCodeCheckBaseUrl;
                    promoCodeCheckUrl = promoCodeCheckUrl.replace('%backendEndpoint%', backendEndpointUrl);

                    var dataToSend = {
                        promoCode: promoCode,
                        studentAppName: backendData[appContext].studentAppName
                    };
                    return $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
                };

                promoCodeSrv.promoCodeToUpdate = function (promoCode) {
                    promoCodeToUpdate = promoCode;
                };

                promoCodeSrv.getPromoCodeToUpdate = function () {
                    return promoCodeToUpdate;
                };

                promoCodeSrv.updatePromoCode = function (uid, promoCode, appContext) {
                    var backendEndpointUrl = backendData[appContext].backendEndpoint;
                    var promoCodeUpdatekUrl = promoCodeUpdateBaseUrl.replace('%backendEndpoint%', backendEndpointUrl);

                    var dataToSend = {
                        currentAppName: backendData[appContext].currentAppName,
                        studentAppName: backendData[appContext].studentAppName,
                        dashboardAppName: backendData[appContext].dashboardAppName,
                        uid: uid,
                        promoCode: promoCode
                    };
                    return $http.post(promoCodeUpdatekUrl, dataToSend);
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

                return promoCodeSrv;
            };
        }
    );
})(angular);
