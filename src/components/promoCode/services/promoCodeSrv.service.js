(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').provider('PromoCodeSrv',
        function ($injector) {
            var backendData = {};
            var _currentApp;

            try {
                $injector.invoke(['ENV', function (ENV) {
                    backendData = {};
                    _currentApp = ENV.firebaseAppScopeName;

                    backendData[_currentApp] = {  //default data
                        backendEndpoint: ENV.backendEndpoint,
                        currentAppName: ENV.firebaseAppScopeName,
                        studentAppName: ENV.studentAppName,
                        dashboardAppName: ENV.dashboardAppName,
                        serviceId: ENV.serviceId
                    };
                }]);
            } catch(error){

            }

            this.setBackendData = function (_backendData) {
                backendData = _backendData;
            };

            this.$get = function (PROMO_CODE_STATUS, $translate, $http, PromoCodeTypeEnum) {
                'ngInject';

                var promoCodeSrv = {};

                var promoCodeStatus;
                var INVALID = 'PROMO_CODE.INVALID_CODE';
                var promoCodeToUpdate;

                var promoCodeStatusText = {};
                promoCodeStatusText[PromoCodeTypeEnum.FREE_LICENSE.enum] = 'PROMO_CODE.PROMO_CODE_ACCEPTED';
                promoCodeStatusText[PromoCodeTypeEnum.ZINKERZ_EDUCATOR.enum] = 'PROMO_CODE.ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED';
                promoCodeStatusText[INVALID] = INVALID;

                promoCodeSrv.checkPromoCode = function (promoCode, currentApp) {
                    var backendEndpointUrl = backendData[currentApp].backendEndpoint;
                    var promoCodeCheckUrl = backendEndpointUrl + 'promoCode/check';

                    var dataToSend = {
                        serviceId: backendData[currentApp].serviceId,
                        promoCode: promoCode,
                        studentAppName: backendData[currentApp].studentAppName
                    };
                    return $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
                };

                promoCodeSrv.promoCodeToUpdate = function (promoCode) {
                    promoCodeToUpdate = promoCode;
                };

                promoCodeSrv.cleanPromoCode = function () {
                    promoCodeToUpdate = null;
                    promoCodeStatus = null;
                };

                promoCodeSrv.getPromoCodeToUpdate = function () {
                    return promoCodeToUpdate;
                };

                promoCodeSrv.updatePromoCode = function (uid, promoCode, currentApp) {
                    var backendEndpointUrl = backendData[currentApp].backendEndpoint;
                    var promoCodeUpdatekUrl = backendEndpointUrl + 'promoCode/update';

                    var dataToSend = {
                        currentAppName: backendData[currentApp].currentAppName,
                        studentAppName: backendData[currentApp].studentAppName,
                        dashboardAppName: backendData[currentApp].dashboardAppName,
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
