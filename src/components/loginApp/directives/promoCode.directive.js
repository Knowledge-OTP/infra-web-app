
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('promoCode',
        function (PromoCodeSrv, PROMO_CODE_STATUS) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/promoCode.template.html',
                restrict: 'E',
                scope: {},
                link: function (scope) {
                    var ENTER_KEY_CODE = 13;

                    scope.d = {};
                    scope.d.promoCodeStatusConst = PROMO_CODE_STATUS;

                    scope.d.sendPromoCode = function (promoCode) {
                        if (promoCode) {
                            scope.d.showSpinner = true;
                            PromoCodeSrv.checkPromoCode(promoCode).then(function (promoCodeResult) {
                                scope.d.promoCodeStatus = promoCodeResult.status;
                                scope.d.promoCodeStatusText = promoCodeResult.text;
                                scope.d.showSpinner = false;
                                if (scope.d.promoCodeStatus === scope.d.promoCodeStatusConst.accepted) {
                                    PromoCodeSrv.promoCodeToUpdate(promoCode);
                                } else {
                                    PromoCodeSrv.promoCodeToUpdate(undefined);
                                }
                            });
                        }
                    };

                    scope.d.clearInput = function () {
                        _cleanPromoCodeStatus();
                        scope.d.promoCode = '';
                    };

                    scope.d.keyDownHandler = function ($event, promoCode) {
                        if ($event.keyCode !== ENTER_KEY_CODE) {
                            _cleanPromoCodeStatus();
                            return;
                        }
                        scope.d.sendPromoCode(promoCode);
                    };

                    function _cleanPromoCodeStatus() {
                        scope.d.promoCodeStatus = -1;
                        scope.d.promoCodeStatusText = '';
                    }
                }
            };
        }
    );
})(angular);
